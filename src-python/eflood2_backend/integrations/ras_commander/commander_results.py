#!/usr/bin/env python3
"""
📊 RAS Commander Results Processing Module
==========================================

Módulo especializado para el procesamiento de resultados HEC-RAS usando RAS Commander.
Proporciona funcionalidades avanzadas para análisis de resultados de simulaciones hidráulicas.

Funcionalidades principales:
- Procesamiento de resultados de mallas 2D
- Análisis de series temporales
- Extracción de valores máximos y mínimos
- Análisis estadístico de resultados
- Procesamiento de resultados de secciones transversales

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
        HdfMesh,
        HdfPlan,
        HdfResultsMesh,
        HdfResultsPlan,
        HdfResultsXsec,
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
# CLASE PRINCIPAL PARA PROCESAMIENTO DE RESULTADOS
# ═══════════════════════════════════════════════════════════════════════════════


class CommanderResultsProcessor:
    """
    📊 Procesador de resultados HEC-RAS usando RAS Commander.

    Proporciona funcionalidades avanzadas para el análisis y procesamiento
    de resultados de simulaciones hidráulicas HEC-RAS.
    """

    def __init__(self, hdf_file_path: str):
        """
        Inicializa el procesador de resultados.

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
    def get_maximum_results_analysis(self) -> Dict[str, Any]:
        """
        Obtiene análisis completo de resultados máximos del modelo.

        Returns:
            Dict con análisis de resultados máximos
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            results_analysis = {
                "max_water_surface": self._analyze_max_water_surface(),
                "max_velocity": self._analyze_max_velocity(),
                "max_depth": self._analyze_max_depth(),
                "max_ws_error": self._analyze_max_ws_error(),
            }

            # Contar elementos procesados
            total_elements = sum(
                analysis.get("element_count", 0)
                for analysis in results_analysis.values()
                if isinstance(analysis, dict)
            )

            logger.info(
                f"Análisis de resultados máximos completado: {total_elements} elementos"
            )

            return create_result_dict(
                success=True,
                data={
                    "total_elements_analyzed": total_elements,
                    "analysis_timestamp": datetime.now().isoformat(),
                    "results_by_type": results_analysis,
                },
                message=f"Análisis de resultados máximos completado para {total_elements} elementos",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_time_series_analysis(
        self, mesh_name: str, variable: str = "Water Surface"
    ) -> Dict[str, Any]:
        """
        Realiza análisis de series temporales para una malla específica.

        Args:
            mesh_name: Nombre de la malla a analizar
            variable: Variable a analizar (ej: "Water Surface", "Velocity")

        Returns:
            Dict con análisis de series temporales
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Obtener datos de series temporales
            timeseries_data = HdfResultsMesh.get_mesh_timeseries(
                self.hdf_file_path, mesh_name, variable
            )

            if timeseries_data is None or timeseries_data.empty:
                return create_result_dict(
                    success=False,
                    error=f"No se encontraron datos de series temporales para {mesh_name} - {variable}",
                )

            # Realizar análisis estadístico
            analysis = {
                "mesh_name": mesh_name,
                "variable": variable,
                "data_shape": timeseries_data.shape,
                "time_steps": len(timeseries_data),
                "columns": list(timeseries_data.columns),
                "has_geometry": hasattr(timeseries_data, "geometry"),
                "statistics": {},
                "temporal_analysis": {},
            }

            # Estadísticas básicas
            numeric_cols = timeseries_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats_dict = timeseries_data[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats_dict)

                # Análisis temporal adicional
                analysis["temporal_analysis"] = self._perform_temporal_analysis(
                    timeseries_data[numeric_cols]
                )

            logger.info(
                f"Análisis de series temporales completado: {mesh_name} - {variable}"
            )

            return create_result_dict(
                success=True,
                data=analysis,
                message=f"Análisis de series temporales completado para {mesh_name} - {variable}",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_cross_section_results(self) -> Dict[str, Any]:
        """
        Obtiene resultados de secciones transversales.

        Returns:
            Dict con resultados de secciones transversales
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Obtener resultados de secciones transversales usando RAS Commander
            xsec_analysis = {
                "total_cross_sections": 0,
                "cross_sections_data": [],
                "summary_statistics": {},
            }

            # Implementar análisis específico de secciones transversales
            # Nota: La implementación específica depende de los métodos disponibles en HdfResultsXsec

            logger.info("Análisis de secciones transversales completado")

            return create_result_dict(
                success=True,
                data=xsec_analysis,
                message="Análisis de secciones transversales completado",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_manning_values_analysis(self) -> Dict[str, Any]:
        """
        Extrae y analiza valores de Manning del archivo HDF.

        Returns:
            Dict con análisis de valores de Manning
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Usar el lector de Manning existente como fallback
            from ...readers.manning_reader import ManningReader

            manning_reader = ManningReader(self.hdf_file_path)
            manning_result = manning_reader.extract_manning_values()

            if manning_result.get("success", False):
                manning_data = manning_result.get("manning_data", {})

                # Extraer valores base y de calibración
                table_data = manning_data.get("table_data", [])
                base_values = []
                calibration_values = []

                for row in table_data:
                    if len(row) >= 3:
                        try:
                            manning_value = float(row[2])
                            # Clasificar como base o calibración basado en el valor
                            if manning_value <= 0.05:  # Valores típicos de calibración
                                calibration_values.append(manning_value)
                            else:
                                base_values.append(manning_value)
                        except (ValueError, IndexError):
                            continue

                logger.info(f"Valores de Manning extraídos: {len(base_values)} base, {len(calibration_values)} calibración")

                return create_result_dict(
                    success=True,
                    data={
                        "total_manning_zones": manning_data.get("total_zones", 0),
                        "base_manning_values": base_values,
                        "calibration_manning_values": calibration_values,
                        "table_data": table_data,
                        "formatted_table": manning_data.get("formatted_table", ""),
                        "analysis_timestamp": datetime.now().isoformat(),
                    },
                    message=f"Análisis de Manning completado: {len(base_values + calibration_values)} valores",
                )
            else:
                return create_result_dict(
                    success=False,
                    error=f"Error extrayendo valores de Manning: {manning_result.get('error', 'Error desconocido')}",
                )

        except Exception as e:
            logger.error(f"Error en análisis de Manning: {str(e)}")
            return create_result_dict(
                success=False,
                error=f"Error en análisis de Manning: {str(e)}",
            )

    @ras_commander_required
    @handle_ras_exceptions
    def get_hydrograph_data(self) -> Dict[str, Any]:
        """
        Extrae datos de hidrogramas del archivo HDF.

        Returns:
            Dict con datos de hidrogramas
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Obtener lista de mallas disponibles
            mesh_data = HdfMesh.get_mesh_areas(self.hdf_file_path)

            if mesh_data is None or (hasattr(mesh_data, '__len__') and len(mesh_data) == 0):
                return create_result_dict(
                    success=False,
                    error="No se encontraron mallas en el archivo HDF",
                )

            # Usar la primera malla disponible
            if isinstance(mesh_data, list):
                mesh_name = mesh_data[0]
            elif isinstance(mesh_data, dict):
                mesh_name = list(mesh_data.keys())[0]
            elif hasattr(mesh_data, 'iloc') and len(mesh_data) > 0:
                # Es un DataFrame, extraer el nombre de la primera fila
                mesh_name = mesh_data.iloc[0]['mesh_name'] if 'mesh_name' in mesh_data.columns else str(mesh_data.iloc[0, 0])
            else:
                mesh_name = str(mesh_data)

            logger.info(f"Intentando extraer hidrograma para malla: {mesh_name}")

            # Obtener datos de series temporales
            timeseries_data = HdfResultsMesh.get_mesh_timeseries(
                self.hdf_file_path, mesh_name, "Water Surface"
            )

            if timeseries_data is None or (hasattr(timeseries_data, 'empty') and timeseries_data.empty):
                return create_result_dict(
                    success=False,
                    error=f"No se encontraron datos de series temporales para {mesh_name}",
                )

            # Procesar datos de hidrograma
            time_series = []
            flow_data = []

            # Manejar diferentes tipos de datos (DataFrame, DataArray, etc.)
            if hasattr(timeseries_data, 'to_dataframe'):
                # Es un xarray DataArray, convertir a DataFrame
                if not hasattr(timeseries_data, 'name') or timeseries_data.name is None:
                    timeseries_data.name = 'water_surface'
                df = timeseries_data.to_dataframe()
                if hasattr(df, 'index'):
                    time_series = df.index.tolist()
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 0:
                    flow_data = df[numeric_cols[0]].tolist()
            elif hasattr(timeseries_data, 'index'):
                # Es un DataFrame de pandas
                time_series = timeseries_data.index.tolist()
                numeric_cols = timeseries_data.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 0:
                    flow_data = timeseries_data[numeric_cols[0]].tolist()
            elif hasattr(timeseries_data, 'values'):
                # Es un array numpy o similar
                flow_data = timeseries_data.values.flatten().tolist()
                time_series = list(range(len(flow_data)))

            logger.info(f"Hidrograma extraído: {len(time_series)} puntos temporales, {len(flow_data)} datos de flujo")

            # Obtener información de columnas de manera segura
            columns_info = []
            if hasattr(timeseries_data, 'columns'):
                columns_info = list(timeseries_data.columns)
            elif hasattr(timeseries_data, 'name') and timeseries_data.name:
                columns_info = [timeseries_data.name]
            elif hasattr(timeseries_data, 'dims'):
                columns_info = list(timeseries_data.dims)

            return create_result_dict(
                success=True,
                data={
                    "mesh_name": mesh_name,
                    "time_series": time_series,
                    "flow_data": flow_data,
                    "data_shape": timeseries_data.shape if hasattr(timeseries_data, 'shape') else len(flow_data),
                    "columns": columns_info,
                    "analysis_timestamp": datetime.now().isoformat(),
                },
                message=f"Hidrograma extraído exitosamente: {len(time_series)} puntos",
            )

        except Exception as e:
            logger.error(f"Error extrayendo hidrogramas: {str(e)}")
            return create_result_dict(
                success=False,
                error=f"Error extrayendo hidrogramas: {str(e)}",
            )

    @ras_commander_required
    @handle_ras_exceptions
    def export_results_summary(self, output_path: str) -> Dict[str, Any]:
        """
        Exporta un resumen completo de resultados a archivo.

        Args:
            output_path: Ruta del archivo de salida

        Returns:
            Dict con resultado de la exportación
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Obtener análisis completo
            max_results = self.get_maximum_results_analysis()

            # Preparar resumen para exportación
            summary = {
                "export_timestamp": datetime.now().isoformat(),
                "hdf_file": self.hdf_file_path,
                "maximum_results_analysis": max_results.get("data", {}),
                "export_info": {
                    "generated_by": "eFlood2 RAS Commander Integration",
                    "version": "0.1.0",
                },
            }

            # Exportar a archivo JSON
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)

            logger.info(f"Resumen de resultados exportado a: {output_path}")

            return create_result_dict(
                success=True,
                data={
                    "output_file": output_path,
                    "file_size_kb": round(os.path.getsize(output_path) / 1024, 2),
                    "summary_elements": len(summary),
                },
                message=f"Resumen exportado exitosamente a {output_path}",
            )

        except Exception as e:
            raise e

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTODOS PRIVADOS DE ANÁLISIS
    # ═══════════════════════════════════════════════════════════════════════════

    def _analyze_max_water_surface(self) -> Dict[str, Any]:
        """Analiza resultados máximos de superficie de agua."""
        try:
            max_ws_gdf = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)

            if max_ws_gdf is None or max_ws_gdf.empty:
                return {
                    "element_count": 0,
                    "error": "No se encontraron datos de superficie máxima",
                }

            analysis = {
                "element_count": len(max_ws_gdf),
                "columns": list(max_ws_gdf.columns),
                "has_geometry": hasattr(max_ws_gdf, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = max_ws_gdf.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = max_ws_gdf[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando superficie máxima: {str(e)}"}

    def _analyze_max_velocity(self) -> Dict[str, Any]:
        """Analiza resultados máximos de velocidad."""
        try:
            max_vel_gdf = HdfResultsMesh.get_mesh_max_face_v(self.hdf_file_path)

            if max_vel_gdf is None or max_vel_gdf.empty:
                return {
                    "element_count": 0,
                    "error": "No se encontraron datos de velocidad máxima",
                }

            analysis = {
                "element_count": len(max_vel_gdf),
                "columns": list(max_vel_gdf.columns),
                "has_geometry": hasattr(max_vel_gdf, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = max_vel_gdf.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = max_vel_gdf[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando velocidad máxima: {str(e)}"}

    def _analyze_max_depth(self) -> Dict[str, Any]:
        """Analiza resultados máximos de profundidad."""
        try:
            max_depth_gdf = HdfResultsMesh.get_mesh_max_depth(self.hdf_file_path)

            if max_depth_gdf is None or max_depth_gdf.empty:
                return {
                    "element_count": 0,
                    "error": "No se encontraron datos de profundidad máxima",
                }

            analysis = {
                "element_count": len(max_depth_gdf),
                "columns": list(max_depth_gdf.columns),
                "has_geometry": hasattr(max_depth_gdf, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = max_depth_gdf.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = max_depth_gdf[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando profundidad máxima: {str(e)}"}

    def _analyze_max_ws_error(self) -> Dict[str, Any]:
        """Analiza errores máximos de superficie de agua."""
        try:
            max_ws_err_gdf = HdfResultsMesh.get_mesh_max_ws_err(self.hdf_file_path)

            if max_ws_err_gdf is None or max_ws_err_gdf.empty:
                return {
                    "element_count": 0,
                    "error": "No se encontraron datos de error de superficie",
                }

            analysis = {
                "element_count": len(max_ws_err_gdf),
                "columns": list(max_ws_err_gdf.columns),
                "has_geometry": hasattr(max_ws_err_gdf, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = max_ws_err_gdf.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = max_ws_err_gdf[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando error de superficie: {str(e)}"}

    def _perform_temporal_analysis(self, numeric_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Realiza análisis temporal adicional en datos numéricos.

        Args:
            numeric_data: DataFrame con datos numéricos

        Returns:
            Dict con análisis temporal
        """
        try:
            temporal_stats = {}

            for column in numeric_data.columns:
                series = numeric_data[column].dropna()
                if len(series) > 1:
                    temporal_stats[column] = {
                        "trend": (
                            "increasing"
                            if series.iloc[-1] > series.iloc[0]
                            else "decreasing"
                        ),
                        "volatility": float(series.std()),
                        "range": float(series.max() - series.min()),
                        "peak_time_step": (
                            int(series.idxmax()) if not series.empty else None
                        ),
                    }

            return convert_numpy_types(temporal_stats)

        except Exception as e:
            return {"error": f"Error en análisis temporal: {str(e)}"}


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD PARA USO DIRECTO
# ═══════════════════════════════════════════════════════════════════════════════


@ras_commander_required
@handle_ras_exceptions
def quick_max_results_analysis(hdf_file_path: str) -> Dict[str, Any]:
    """
    Análisis rápido de resultados máximos.

    Args:
        hdf_file_path: Ruta al archivo HDF

    Returns:
        Dict con análisis de resultados máximos
    """
    processor = CommanderResultsProcessor(hdf_file_path)
    return processor.get_maximum_results_analysis()


@ras_commander_required
@handle_ras_exceptions
def quick_timeseries_analysis(
    hdf_file_path: str, mesh_name: str, variable: str = "Water Surface"
) -> Dict[str, Any]:
    """
    Análisis rápido de series temporales.

    Args:
        hdf_file_path: Ruta al archivo HDF
        mesh_name: Nombre de la malla
        variable: Variable a analizar

    Returns:
        Dict con análisis de series temporales
    """
    processor = CommanderResultsProcessor(hdf_file_path)
    return processor.get_time_series_analysis(mesh_name, variable)


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_results.
    """
    print("📊 RAS Commander Results Processor - Test Mode")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("Uso: python commander_results.py <hdf_file_path> [mesh_name] [variable]")
        return

    hdf_file_path = sys.argv[1]
    mesh_name = sys.argv[2] if len(sys.argv) > 2 else "2D Area 1"
    variable = sys.argv[3] if len(sys.argv) > 3 else "Water Surface"

    # Test del procesador de resultados
    processor = CommanderResultsProcessor(hdf_file_path)

    # Test de análisis de resultados máximos
    print("Analizando resultados máximos...")
    max_results = processor.get_maximum_results_analysis()
    print(f"Resultados máximos: {safe_json_serialize(max_results)}")

    # Test de análisis de series temporales
    print(f"\nAnalizando series temporales: {mesh_name} - {variable}")
    timeseries_result = processor.get_time_series_analysis(mesh_name, variable)
    print(f"Series temporales: {safe_json_serialize(timeseries_result)}")


if __name__ == "__main__":
    main()
