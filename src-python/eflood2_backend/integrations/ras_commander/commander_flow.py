#!/usr/bin/env python3
"""
🌊 RAS Commander Flow Analysis Module
====================================

Módulo especializado para el análisis de flujo y condiciones de frontera HEC-RAS usando RAS Commander.
Proporciona funcionalidades avanzadas para análisis hidráulico y gestión de condiciones de frontera.

Funcionalidades principales:
- Análisis de condiciones de frontera
- Procesamiento de datos de flujo
- Análisis fluvial-pluvial
- Gestión de hidrogramas
- Análisis de precipitación e infiltración

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
    from ras_commander import HdfBndry, HdfFluvialPluvial, HdfMesh, HdfPlan, RasUnsteady

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
# CLASE PRINCIPAL PARA ANÁLISIS DE FLUJO
# ═══════════════════════════════════════════════════════════════════════════════


class CommanderFlowAnalyzer:
    """
    🌊 Analizador de flujo HEC-RAS usando RAS Commander.

    Proporciona funcionalidades avanzadas para el análisis de flujo,
    condiciones de frontera y análisis hidráulico en modelos HEC-RAS.
    """

    def __init__(self, hdf_file_path: str):
        """
        Inicializa el analizador de flujo.

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
    def get_boundary_conditions_analysis(self) -> Dict[str, Any]:
        """
        Realiza análisis completo de condiciones de frontera.

        Returns:
            Dict con análisis detallado de condiciones de frontera
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            boundary_analysis = {
                "flow_boundaries": self._analyze_flow_boundaries(),
                "stage_boundaries": self._analyze_stage_boundaries(),
                "precipitation": self._analyze_precipitation(),
                "infiltration": self._analyze_infiltration(),
                "breaklines": self._analyze_boundary_breaklines(),
            }

            # Contar total de elementos de frontera
            total_boundaries = sum(
                analysis.get("count", 0)
                for analysis in boundary_analysis.values()
                if isinstance(analysis, dict)
            )

            logger.info(
                f"Análisis de condiciones de frontera completado: {total_boundaries} elementos"
            )

            return create_result_dict(
                success=True,
                data={
                    "total_boundary_elements": total_boundaries,
                    "analysis_timestamp": datetime.now().isoformat(),
                    "boundaries_by_type": boundary_analysis,
                },
                message=f"Análisis de {total_boundaries} condiciones de frontera completado",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_fluvial_pluvial_analysis(self, delta_t: int = 12) -> Dict[str, Any]:
        """
        Realiza análisis fluvial-pluvial usando RAS Commander.

        Args:
            delta_t: Umbral de tiempo en horas para el análisis

        Returns:
            Dict con análisis fluvial-pluvial
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Realizar análisis fluvial-pluvial usando RAS Commander
            boundary_data = HdfFluvialPluvial.calculate_fluvial_pluvial_boundary(
                self.hdf_file_path, delta_t=delta_t
            )

            if boundary_data is None or boundary_data.empty:
                return create_result_dict(
                    success=False,
                    error=f"No se pudieron calcular límites fluvial-pluvial con delta_t={delta_t}h",
                )

            # Análisis de los datos de frontera
            analysis = {
                "delta_t_hours": delta_t,
                "boundary_elements": len(boundary_data),
                "columns": list(boundary_data.columns),
                "has_geometry": hasattr(boundary_data, "geometry"),
                "statistics": {},
                "spatial_info": {},
            }

            # Estadísticas de columnas numéricas
            numeric_cols = boundary_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats_dict = boundary_data[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats_dict)

            # Información espacial si hay geometría
            if (
                hasattr(boundary_data, "geometry")
                and boundary_data.geometry is not None
            ):
                bounds = boundary_data.total_bounds
                analysis["spatial_info"] = {
                    "bounds": {
                        "minx": float(bounds[0]),
                        "miny": float(bounds[1]),
                        "maxx": float(bounds[2]),
                        "maxy": float(bounds[3]),
                    },
                    "crs": str(boundary_data.crs) if boundary_data.crs else None,
                }

            logger.info(
                f"Análisis fluvial-pluvial completado: {len(boundary_data)} elementos"
            )

            return create_result_dict(
                success=True,
                data=analysis,
                message=f"Análisis fluvial-pluvial completado con {len(boundary_data)} elementos",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_hydrograph_analysis(self) -> Dict[str, Any]:
        """
        Realiza análisis de hidrogramas del modelo.

        Returns:
            Dict con análisis de hidrogramas
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Análisis de hidrogramas usando datos de frontera
            hydrograph_analysis = {
                "flow_hydrographs": self._analyze_flow_hydrographs(),
                "stage_hydrographs": self._analyze_stage_hydrographs(),
                "precipitation_hyetographs": self._analyze_precipitation_hyetographs(),
            }

            # Contar hidrogramas procesados
            total_hydrographs = sum(
                analysis.get("count", 0)
                for analysis in hydrograph_analysis.values()
                if isinstance(analysis, dict)
            )

            logger.info(
                f"Análisis de hidrogramas completado: {total_hydrographs} elementos"
            )

            return create_result_dict(
                success=True,
                data={
                    "total_hydrographs": total_hydrographs,
                    "analysis_timestamp": datetime.now().isoformat(),
                    "hydrographs_by_type": hydrograph_analysis,
                },
                message=f"Análisis de {total_hydrographs} hidrogramas completado",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def export_flow_data(self, output_directory: str) -> Dict[str, Any]:
        """
        Exporta datos de flujo a archivos.

        Args:
            output_directory: Directorio de salida

        Returns:
            Dict con resultado de la exportación
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            os.makedirs(output_directory, exist_ok=True)
            exported_files = []

            # Exportar análisis de condiciones de frontera
            boundary_analysis = self.get_boundary_conditions_analysis()
            if boundary_analysis["success"]:
                boundary_file = os.path.join(
                    output_directory, "boundary_conditions_analysis.json"
                )
                with open(boundary_file, "w", encoding="utf-8") as f:
                    json.dump(
                        boundary_analysis["data"], f, indent=2, ensure_ascii=False
                    )
                exported_files.append(boundary_file)

            # Exportar análisis fluvial-pluvial
            fluvial_pluvial = self.get_fluvial_pluvial_analysis()
            if fluvial_pluvial["success"]:
                fp_file = os.path.join(
                    output_directory, "fluvial_pluvial_analysis.json"
                )
                with open(fp_file, "w", encoding="utf-8") as f:
                    json.dump(fluvial_pluvial["data"], f, indent=2, ensure_ascii=False)
                exported_files.append(fp_file)

            # Exportar análisis de hidrogramas
            hydrograph_analysis = self.get_hydrograph_analysis()
            if hydrograph_analysis["success"]:
                hydro_file = os.path.join(output_directory, "hydrograph_analysis.json")
                with open(hydro_file, "w", encoding="utf-8") as f:
                    json.dump(
                        hydrograph_analysis["data"], f, indent=2, ensure_ascii=False
                    )
                exported_files.append(hydro_file)

            logger.info(f"Datos de flujo exportados: {len(exported_files)} archivos")

            return create_result_dict(
                success=True,
                data={
                    "output_directory": output_directory,
                    "exported_files": exported_files,
                    "total_files": len(exported_files),
                },
                message=f"Datos de flujo exportados exitosamente: {len(exported_files)} archivos",
            )

        except Exception as e:
            raise e

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTODOS PRIVADOS DE ANÁLISIS
    # ═══════════════════════════════════════════════════════════════════════════

    def _analyze_flow_boundaries(self) -> Dict[str, Any]:
        """Analiza condiciones de frontera de flujo."""
        try:
            # Obtener condiciones de frontera de flujo usando RAS Commander
            flow_boundaries = HdfBndry.get_flow_boundaries(self.hdf_file_path)

            if flow_boundaries is None or flow_boundaries.empty:
                return {
                    "count": 0,
                    "note": "No se encontraron condiciones de frontera de flujo",
                }

            analysis = {
                "count": len(flow_boundaries),
                "columns": list(flow_boundaries.columns),
                "has_geometry": hasattr(flow_boundaries, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = flow_boundaries.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = flow_boundaries[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando condiciones de flujo: {str(e)}"}

    def _analyze_stage_boundaries(self) -> Dict[str, Any]:
        """Analiza condiciones de frontera de nivel."""
        try:
            # Obtener condiciones de frontera de nivel usando RAS Commander
            stage_boundaries = HdfBndry.get_stage_boundaries(self.hdf_file_path)

            if stage_boundaries is None or stage_boundaries.empty:
                return {
                    "count": 0,
                    "note": "No se encontraron condiciones de frontera de nivel",
                }

            analysis = {
                "count": len(stage_boundaries),
                "columns": list(stage_boundaries.columns),
                "has_geometry": hasattr(stage_boundaries, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = stage_boundaries.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = stage_boundaries[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando condiciones de nivel: {str(e)}"}

    def _analyze_precipitation(self) -> Dict[str, Any]:
        """Analiza datos de precipitación."""
        try:
            # Obtener datos de precipitación usando RAS Commander
            precipitation_data = HdfBndry.get_precipitation(self.hdf_file_path)

            if precipitation_data is None or precipitation_data.empty:
                return {"count": 0, "note": "No se encontraron datos de precipitación"}

            analysis = {
                "count": len(precipitation_data),
                "columns": list(precipitation_data.columns),
                "has_geometry": hasattr(precipitation_data, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = precipitation_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = precipitation_data[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando precipitación: {str(e)}"}

    def _analyze_infiltration(self) -> Dict[str, Any]:
        """Analiza datos de infiltración."""
        try:
            # Obtener datos de infiltración usando RAS Commander
            infiltration_data = HdfBndry.get_infiltration(self.hdf_file_path)

            if infiltration_data is None or infiltration_data.empty:
                return {"count": 0, "note": "No se encontraron datos de infiltración"}

            analysis = {
                "count": len(infiltration_data),
                "columns": list(infiltration_data.columns),
                "has_geometry": hasattr(infiltration_data, "geometry"),
            }

            # Estadísticas si hay datos numéricos
            numeric_cols = infiltration_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = infiltration_data[numeric_cols].describe().to_dict()
                analysis["statistics"] = convert_numpy_types(stats)

            return analysis

        except Exception as e:
            return {"error": f"Error analizando infiltración: {str(e)}"}

    def _analyze_boundary_breaklines(self) -> Dict[str, Any]:
        """Analiza breaklines relacionadas con condiciones de frontera."""
        try:
            # Obtener breaklines usando RAS Commander
            breaklines = HdfBndry.get_breaklines(self.hdf_file_path)

            if breaklines is None or breaklines.empty:
                return {"count": 0, "note": "No se encontraron breaklines"}

            return {
                "count": len(breaklines),
                "columns": list(breaklines.columns),
                "has_geometry": hasattr(breaklines, "geometry"),
            }

        except Exception as e:
            return {"error": f"Error analizando breaklines: {str(e)}"}

    def _analyze_flow_hydrographs(self) -> Dict[str, Any]:
        """Analiza hidrogramas de flujo."""
        try:
            return {
                "count": 0,
                "note": "Análisis de hidrogramas de flujo pendiente de implementación",
            }
        except Exception as e:
            return {"error": f"Error analizando hidrogramas de flujo: {str(e)}"}

    def _analyze_stage_hydrographs(self) -> Dict[str, Any]:
        """Analiza hidrogramas de nivel."""
        try:
            return {
                "count": 0,
                "note": "Análisis de hidrogramas de nivel pendiente de implementación",
            }
        except Exception as e:
            return {"error": f"Error analizando hidrogramas de nivel: {str(e)}"}

    def _analyze_precipitation_hyetographs(self) -> Dict[str, Any]:
        """Analiza hietogramas de precipitación."""
        try:
            return {
                "count": 0,
                "note": "Análisis de hietogramas pendiente de implementación",
            }
        except Exception as e:
            return {"error": f"Error analizando hietogramas: {str(e)}"}


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD PARA USO DIRECTO
# ═══════════════════════════════════════════════════════════════════════════════


@ras_commander_required
@handle_ras_exceptions
def quick_boundary_analysis(hdf_file_path: str) -> Dict[str, Any]:
    """
    Análisis rápido de condiciones de frontera.

    Args:
        hdf_file_path: Ruta al archivo HDF

    Returns:
        Dict con análisis de condiciones de frontera
    """
    analyzer = CommanderFlowAnalyzer(hdf_file_path)
    return analyzer.get_boundary_conditions_analysis()


@ras_commander_required
@handle_ras_exceptions
def quick_fluvial_pluvial_analysis(
    hdf_file_path: str, delta_t: int = 12
) -> Dict[str, Any]:
    """
    Análisis rápido fluvial-pluvial.

    Args:
        hdf_file_path: Ruta al archivo HDF
        delta_t: Umbral de tiempo en horas

    Returns:
        Dict con análisis fluvial-pluvial
    """
    analyzer = CommanderFlowAnalyzer(hdf_file_path)
    return analyzer.get_fluvial_pluvial_analysis(delta_t)


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_flow.
    """
    print("🌊 RAS Commander Flow Analyzer - Test Mode")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("Uso: python commander_flow.py <hdf_file_path> [delta_t]")
        return

    hdf_file_path = sys.argv[1]
    delta_t = int(sys.argv[2]) if len(sys.argv) > 2 else 12

    # Test del analizador de flujo
    analyzer = CommanderFlowAnalyzer(hdf_file_path)

    # Test de análisis de condiciones de frontera
    print("Analizando condiciones de frontera...")
    boundary_result = analyzer.get_boundary_conditions_analysis()
    print(f"Condiciones de frontera: {safe_json_serialize(boundary_result)}")

    # Test de análisis fluvial-pluvial
    print(f"\nAnalizando límites fluvial-pluvial (delta_t={delta_t}h)...")
    fp_result = analyzer.get_fluvial_pluvial_analysis(delta_t)
    print(f"Fluvial-pluvial: {safe_json_serialize(fp_result)}")


if __name__ == "__main__":
    main()
