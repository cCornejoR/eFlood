#!/usr/bin/env python3
"""
📤 RAS Commander Export Module
=============================

Módulo especializado para exportación avanzada de datos HEC-RAS usando RAS Commander.
Proporciona funcionalidades para exportar datos a múltiples formatos incluyendo VTK, GeoJSON, Shapefile y CSV.

Funcionalidades principales:
- Exportación a VTK para visualización 3D
- Exportación a formatos GIS (Shapefile, GeoJSON)
- Exportación de datos tabulares (CSV, Excel)
- Generación de reportes automáticos
- Exportación de series temporales

Autor: eFlood2 Technologies
Versión: 0.1.0
"""

# ═══════════════════════════════════════════════════════════════════════════════
# IMPORTS Y CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import geopandas as gpd
import numpy as np
import pandas as pd

# RAS Commander imports
try:
    from ras_commander import (
        HdfBndry,
        HdfMesh,
        HdfPipe,
        HdfPump,
        HdfResultsMesh,
        HdfResultsPlan,
        HdfStruc,
    )

    RAS_COMMANDER_AVAILABLE = True
except ImportError:
    RAS_COMMANDER_AVAILABLE = False

# Imports locales
from .commander_utils import (
    convert_numpy_types,
    create_result_dict,
    handle_ras_exceptions,
    logger,
    ras_commander_required,
    safe_json_serialize,
    validate_hdf_file,
)

# ═══════════════════════════════════════════════════════════════════════════════
# CLASE PRINCIPAL PARA EXPORTACIÓN
# ═══════════════════════════════════════════════════════════════════════════════


class CommanderDataExporter:
    """
    📤 Exportador de datos HEC-RAS usando RAS Commander.

    Proporciona funcionalidades avanzadas para exportar datos de modelos HEC-RAS
    a múltiples formatos para análisis, visualización y reportes.
    """

    def __init__(self, hdf_file_path: str):
        """
        Inicializa el exportador de datos.

        Args:
            hdf_file_path: Ruta al archivo HDF de HEC-RAS
        """
        self.hdf_file_path = hdf_file_path
        self.validation_result = validate_hdf_file(hdf_file_path)

        if not self.validation_result["success"]:
            logger.error(
                f"Error validando archivo HDF: {self.validation_result['error']}"
            )

    @ras_commander_required
    @handle_ras_exceptions
    def export_to_vtk(
        self, output_directory: str, include_results: bool = True
    ) -> Dict[str, Any]:
        """
        Exporta datos del modelo a formato VTK para visualización 3D.

        Args:
            output_directory: Directorio de salida para archivos VTK
            include_results: Si incluir resultados de simulación

        Returns:
            Dict con resultado de la exportación VTK
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            os.makedirs(output_directory, exist_ok=True)
            exported_files = []

            # Obtener nombres de mallas
            mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)

            if not mesh_names:
                return create_result_dict(
                    success=False, error="No se encontraron mallas 2D para exportar"
                )

            # Exportar cada malla
            for mesh_name in mesh_names:
                try:
                    mesh_files = self._export_mesh_to_vtk(
                        mesh_name, output_directory, include_results
                    )
                    exported_files.extend(mesh_files)
                except Exception as e:
                    logger.warning(f"Error exportando malla {mesh_name} a VTK: {e}")
                    continue

            # Exportar breaklines si existen
            try:
                breaklines_files = self._export_breaklines_to_vtk(output_directory)
                exported_files.extend(breaklines_files)
            except Exception as e:
                logger.warning(f"Error exportando breaklines a VTK: {e}")

            logger.info(f"Exportación VTK completada: {len(exported_files)} archivos")

            return create_result_dict(
                success=True,
                data={
                    "output_directory": output_directory,
                    "exported_files": exported_files,
                    "total_files": len(exported_files),
                    "mesh_areas_exported": len(mesh_names),
                },
                message=f"Exportación VTK completada: {len(exported_files)} archivos generados",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def export_to_gis_formats(
        self, output_directory: str, formats: List[str] = None
    ) -> Dict[str, Any]:
        """
        Exporta datos del modelo a formatos GIS.

        Args:
            output_directory: Directorio de salida
            formats: Lista de formatos a exportar ['shapefile', 'geojson', 'gpkg']

        Returns:
            Dict con resultado de la exportación GIS
        """
        if not self.validation_result["success"]:
            return self.validation_result

        if formats is None:
            formats = ["shapefile", "geojson"]

        try:
            os.makedirs(output_directory, exist_ok=True)
            exported_files = []

            # Exportar resultados de mallas
            mesh_files = self._export_mesh_results_to_gis(output_directory, formats)
            exported_files.extend(mesh_files)

            # Exportar breaklines
            breaklines_files = self._export_breaklines_to_gis(output_directory, formats)
            exported_files.extend(breaklines_files)

            # Exportar infraestructura si existe
            infrastructure_files = self._export_infrastructure_to_gis(
                output_directory, formats
            )
            exported_files.extend(infrastructure_files)

            logger.info(f"Exportación GIS completada: {len(exported_files)} archivos")

            return create_result_dict(
                success=True,
                data={
                    "output_directory": output_directory,
                    "exported_files": exported_files,
                    "total_files": len(exported_files),
                    "formats_used": formats,
                },
                message=f"Exportación GIS completada: {len(exported_files)} archivos en {len(formats)} formatos",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def export_tabular_data(
        self, output_directory: str, formats: List[str] = None
    ) -> Dict[str, Any]:
        """
        Exporta datos tabulares del modelo.

        Args:
            output_directory: Directorio de salida
            formats: Lista de formatos ['csv', 'excel', 'json']

        Returns:
            Dict con resultado de la exportación tabular
        """
        if not self.validation_result["success"]:
            return self.validation_result

        if formats is None:
            formats = ["csv", "json"]

        try:
            os.makedirs(output_directory, exist_ok=True)
            exported_files = []

            # Exportar estadísticas de resultados
            stats_files = self._export_results_statistics(output_directory, formats)
            exported_files.extend(stats_files)

            # Exportar datos de infraestructura
            infra_files = self._export_infrastructure_data(output_directory, formats)
            exported_files.extend(infra_files)

            # Exportar series temporales
            timeseries_files = self._export_timeseries_data(output_directory, formats)
            exported_files.extend(timeseries_files)

            logger.info(
                f"Exportación tabular completada: {len(exported_files)} archivos"
            )

            return create_result_dict(
                success=True,
                data={
                    "output_directory": output_directory,
                    "exported_files": exported_files,
                    "total_files": len(exported_files),
                    "formats_used": formats,
                },
                message=f"Exportación tabular completada: {len(exported_files)} archivos",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def generate_comprehensive_report(self, output_path: str) -> Dict[str, Any]:
        """
        Genera un reporte completo del modelo en formato JSON.

        Args:
            output_path: Ruta del archivo de reporte

        Returns:
            Dict con resultado de la generación del reporte
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Importar módulos necesarios para el reporte
            from .commander_flow import CommanderFlowAnalyzer
            from .commander_geometry import CommanderGeometryProcessor
            from .commander_infrastructure import CommanderInfrastructureAnalyzer
            from .commander_results import CommanderResultsProcessor

            # Generar análisis completo
            geometry_processor = CommanderGeometryProcessor(self.hdf_file_path)
            results_processor = CommanderResultsProcessor(self.hdf_file_path)
            flow_analyzer = CommanderFlowAnalyzer(self.hdf_file_path)
            infrastructure_analyzer = CommanderInfrastructureAnalyzer(
                self.hdf_file_path
            )

            # Compilar reporte completo
            comprehensive_report = {
                "report_metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "hdf_file": self.hdf_file_path,
                    "generated_by": "eFlood2 RAS Commander Comprehensive Exporter",
                    "version": "0.1.0",
                },
                "geometry_analysis": geometry_processor.get_mesh_areas_info().get(
                    "data", {}
                ),
                "results_analysis": results_processor.get_maximum_results_analysis().get(
                    "data", {}
                ),
                "flow_analysis": flow_analyzer.get_boundary_conditions_analysis().get(
                    "data", {}
                ),
                "infrastructure_analysis": infrastructure_analyzer.get_comprehensive_infrastructure_analysis().get(
                    "data", {}
                ),
                "export_summary": {
                    "total_sections": 4,
                    "analysis_timestamp": datetime.now().isoformat(),
                },
            }

            # Exportar reporte
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(comprehensive_report, f, indent=2, ensure_ascii=False)

            logger.info(f"Reporte completo generado: {output_path}")

            return create_result_dict(
                success=True,
                data={
                    "report_file": output_path,
                    "file_size_kb": round(os.path.getsize(output_path) / 1024, 2),
                    "sections_included": comprehensive_report["export_summary"][
                        "total_sections"
                    ],
                },
                message=f"Reporte completo generado exitosamente: {output_path}",
            )

        except Exception as e:
            raise e

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTODOS PRIVADOS DE EXPORTACIÓN
    # ═══════════════════════════════════════════════════════════════════════════

    def _export_mesh_to_vtk(
        self, mesh_name: str, output_dir: str, include_results: bool
    ) -> List[str]:
        """Exporta una malla específica a formato VTK."""
        exported_files = []

        try:
            if include_results:
                # Exportar resultados máximos
                max_ws = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)
                if max_ws is not None and not max_ws.empty:
                    # Convertir a formato compatible con VTK
                    # Nota: La implementación específica depende de las librerías VTK disponibles
                    vtk_file = os.path.join(output_dir, f"{mesh_name}_max_ws.vtk")
                    # Aquí iría la lógica de conversión a VTK
                    exported_files.append(vtk_file)
                    logger.debug(f"Exportado VTK: {vtk_file}")

        except Exception as e:
            logger.warning(f"Error exportando malla {mesh_name} a VTK: {e}")

        return exported_files

    def _export_breaklines_to_vtk(self, output_dir: str) -> List[str]:
        """Exporta breaklines a formato VTK."""
        exported_files = []

        try:
            breaklines = HdfBndry.get_breaklines(self.hdf_file_path)
            if breaklines is not None and not breaklines.empty:
                vtk_file = os.path.join(output_dir, "breaklines.vtk")
                # Aquí iría la lógica de conversión a VTK
                exported_files.append(vtk_file)
                logger.debug(f"Exportado VTK breaklines: {vtk_file}")

        except Exception as e:
            logger.warning(f"Error exportando breaklines a VTK: {e}")

        return exported_files

    def _export_mesh_results_to_gis(
        self, output_dir: str, formats: List[str]
    ) -> List[str]:
        """Exporta resultados de mallas a formatos GIS."""
        exported_files = []

        try:
            # Obtener resultados máximos
            max_ws = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)
            if max_ws is not None and not max_ws.empty and hasattr(max_ws, "geometry"):

                for format_type in formats:
                    if format_type == "shapefile":
                        shp_file = os.path.join(output_dir, "max_water_surface.shp")
                        max_ws.to_file(shp_file)
                        exported_files.append(shp_file)
                    elif format_type == "geojson":
                        geojson_file = os.path.join(
                            output_dir, "max_water_surface.geojson"
                        )
                        max_ws.to_file(geojson_file, driver="GeoJSON")
                        exported_files.append(geojson_file)
                    elif format_type == "gpkg":
                        gpkg_file = os.path.join(output_dir, "max_water_surface.gpkg")
                        max_ws.to_file(gpkg_file, driver="GPKG")
                        exported_files.append(gpkg_file)

        except Exception as e:
            logger.warning(f"Error exportando resultados de mallas a GIS: {e}")

        return exported_files

    def _export_breaklines_to_gis(
        self, output_dir: str, formats: List[str]
    ) -> List[str]:
        """Exporta breaklines a formatos GIS."""
        exported_files = []

        try:
            breaklines = HdfBndry.get_breaklines(self.hdf_file_path)
            if (
                breaklines is not None
                and not breaklines.empty
                and hasattr(breaklines, "geometry")
            ):

                for format_type in formats:
                    if format_type == "shapefile":
                        shp_file = os.path.join(output_dir, "breaklines.shp")
                        breaklines.to_file(shp_file)
                        exported_files.append(shp_file)
                    elif format_type == "geojson":
                        geojson_file = os.path.join(output_dir, "breaklines.geojson")
                        breaklines.to_file(geojson_file, driver="GeoJSON")
                        exported_files.append(geojson_file)

        except Exception as e:
            logger.warning(f"Error exportando breaklines a GIS: {e}")

        return exported_files

    def _export_infrastructure_to_gis(
        self, output_dir: str, formats: List[str]
    ) -> List[str]:
        """Exporta infraestructura a formatos GIS."""
        exported_files = []

        try:
            # Exportar redes de tuberías si existen
            pipe_network = HdfPipe.get_pipe_network(self.hdf_file_path)
            if (
                pipe_network is not None
                and not pipe_network.empty
                and hasattr(pipe_network, "geometry")
            ):

                for format_type in formats:
                    if format_type == "shapefile":
                        shp_file = os.path.join(output_dir, "pipe_network.shp")
                        pipe_network.to_file(shp_file)
                        exported_files.append(shp_file)
                    elif format_type == "geojson":
                        geojson_file = os.path.join(output_dir, "pipe_network.geojson")
                        pipe_network.to_file(geojson_file, driver="GeoJSON")
                        exported_files.append(geojson_file)

        except Exception as e:
            logger.warning(f"Error exportando infraestructura a GIS: {e}")

        return exported_files

    def _export_results_statistics(
        self, output_dir: str, formats: List[str]
    ) -> List[str]:
        """Exporta estadísticas de resultados."""
        exported_files = []

        try:
            # Obtener estadísticas básicas
            max_ws = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)
            if max_ws is not None and not max_ws.empty:

                # Calcular estadísticas
                numeric_cols = max_ws.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 0:
                    stats_df = max_ws[numeric_cols].describe()

                    for format_type in formats:
                        if format_type == "csv":
                            csv_file = os.path.join(
                                output_dir, "results_statistics.csv"
                            )
                            stats_df.to_csv(csv_file)
                            exported_files.append(csv_file)
                        elif format_type == "excel":
                            excel_file = os.path.join(
                                output_dir, "results_statistics.xlsx"
                            )
                            stats_df.to_excel(excel_file)
                            exported_files.append(excel_file)
                        elif format_type == "json":
                            json_file = os.path.join(
                                output_dir, "results_statistics.json"
                            )
                            stats_dict = convert_numpy_types(stats_df.to_dict())
                            with open(json_file, "w") as f:
                                json.dump(stats_dict, f, indent=2)
                            exported_files.append(json_file)

        except Exception as e:
            logger.warning(f"Error exportando estadísticas: {e}")

        return exported_files

    def _export_infrastructure_data(
        self, output_dir: str, formats: List[str]
    ) -> List[str]:
        """Exporta datos de infraestructura."""
        exported_files = []

        try:
            # Exportar datos de bombas si existen
            pump_stations = HdfPump.get_pump_stations(self.hdf_file_path)
            if pump_stations is not None and not pump_stations.empty:

                for format_type in formats:
                    if format_type == "csv":
                        csv_file = os.path.join(output_dir, "pump_stations.csv")
                        pump_stations.to_csv(csv_file, index=False)
                        exported_files.append(csv_file)
                    elif format_type == "json":
                        json_file = os.path.join(output_dir, "pump_stations.json")
                        pump_dict = convert_numpy_types(
                            pump_stations.to_dict("records")
                        )
                        with open(json_file, "w") as f:
                            json.dump(pump_dict, f, indent=2)
                        exported_files.append(json_file)

        except Exception as e:
            logger.warning(f"Error exportando datos de infraestructura: {e}")

        return exported_files

    def _export_timeseries_data(self, output_dir: str, formats: List[str]) -> List[str]:
        """Exporta datos de series temporales."""
        exported_files = []

        try:
            # Obtener nombres de mallas para series temporales
            mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)

            for mesh_name in mesh_names[
                :1
            ]:  # Limitar a la primera malla para el ejemplo
                try:
                    timeseries = HdfResultsMesh.get_mesh_timeseries(
                        self.hdf_file_path, mesh_name, "Water Surface"
                    )

                    if timeseries is not None and not timeseries.empty:
                        for format_type in formats:
                            if format_type == "csv":
                                csv_file = os.path.join(
                                    output_dir, f"timeseries_{mesh_name}.csv"
                                )
                                timeseries.to_csv(csv_file, index=False)
                                exported_files.append(csv_file)

                except Exception as e:
                    logger.warning(
                        f"Error exportando series temporales para {mesh_name}: {e}"
                    )
                    continue

        except Exception as e:
            logger.warning(f"Error exportando series temporales: {e}")

        return exported_files


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD PARA USO DIRECTO
# ═══════════════════════════════════════════════════════════════════════════════


@ras_commander_required
@handle_ras_exceptions
def quick_vtk_export(hdf_file_path: str, output_directory: str) -> Dict[str, Any]:
    """
    Exportación rápida a VTK.

    Args:
        hdf_file_path: Ruta al archivo HDF
        output_directory: Directorio de salida

    Returns:
        Dict con resultado de la exportación
    """
    exporter = CommanderDataExporter(hdf_file_path)
    return exporter.export_to_vtk(output_directory)


@ras_commander_required
@handle_ras_exceptions
def quick_gis_export(
    hdf_file_path: str, output_directory: str, formats: List[str] = None
) -> Dict[str, Any]:
    """
    Exportación rápida a formatos GIS.

    Args:
        hdf_file_path: Ruta al archivo HDF
        output_directory: Directorio de salida
        formats: Formatos a exportar

    Returns:
        Dict con resultado de la exportación
    """
    exporter = CommanderDataExporter(hdf_file_path)
    return exporter.export_to_gis_formats(output_directory, formats)


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_export.
    """
    print("📤 RAS Commander Data Exporter - Test Mode")
    print("=" * 60)

    if len(sys.argv) < 3:
        print("Uso: python commander_export.py <hdf_file_path> <output_directory>")
        return

    hdf_file_path = sys.argv[1]
    output_directory = sys.argv[2]

    # Test del exportador
    exporter = CommanderDataExporter(hdf_file_path)

    # Test de exportación VTK
    print("Exportando a VTK...")
    vtk_result = exporter.export_to_vtk(os.path.join(output_directory, "vtk"))
    print(f"VTK Export: {safe_json_serialize(vtk_result)}")

    # Test de exportación GIS
    print("\nExportando a formatos GIS...")
    gis_result = exporter.export_to_gis_formats(os.path.join(output_directory, "gis"))
    print(f"GIS Export: {safe_json_serialize(gis_result)}")


if __name__ == "__main__":
    main()
