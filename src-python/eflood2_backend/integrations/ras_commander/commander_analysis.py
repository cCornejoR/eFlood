#!/usr/bin/env python3
"""
🔬 RAS Commander Advanced Analysis Module
=========================================

Módulo especializado para análisis avanzados HEC-RAS usando RAS Commander.
Proporciona funcionalidades para análisis especializados como fluvial-pluvial,
análisis de riesgo, estadísticas avanzadas y análisis comparativos.

Funcionalidades principales:
- Análisis fluvial-pluvial avanzado
- Análisis de riesgo de inundación
- Estadísticas espaciales y temporales
- Análisis comparativo entre escenarios
- Análisis de sensibilidad

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
import warnings
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
        HdfFluvialPluvial,
        HdfMesh,
        HdfPlan,
        HdfResultsMesh,
        HdfResultsPlan,
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
# CLASE PRINCIPAL PARA ANÁLISIS AVANZADOS
# ═══════════════════════════════════════════════════════════════════════════════


class CommanderAdvancedAnalyzer:
    """
    🔬 Analizador avanzado HEC-RAS usando RAS Commander.

    Proporciona funcionalidades especializadas para análisis avanzados
    de modelos hidráulicos incluyendo análisis de riesgo y comparaciones.
    """

    def __init__(self, hdf_file_path: str):
        """
        Inicializa el analizador avanzado.

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
    def perform_fluvial_pluvial_analysis(
        self, delta_t_values: List[int] = None
    ) -> Dict[str, Any]:
        """
        Realiza análisis fluvial-pluvial avanzado con múltiples umbrales temporales.

        Args:
            delta_t_values: Lista de umbrales temporales en horas

        Returns:
            Dict con análisis fluvial-pluvial avanzado
        """
        if not self.validation_result["success"]:
            return self.validation_result

        if delta_t_values is None:
            delta_t_values = [6, 12, 24, 48]

        try:
            analysis_results = {
                "delta_t_analyses": {},
                "comparative_analysis": {},
                "summary_statistics": {},
            }

            # Realizar análisis para cada umbral temporal
            for delta_t in delta_t_values:
                try:
                    boundary_data = (
                        HdfFluvialPluvial.calculate_fluvial_pluvial_boundary(
                            self.hdf_file_path, delta_t=delta_t
                        )
                    )

                    if boundary_data is not None and not boundary_data.empty:
                        analysis_results["delta_t_analyses"][f"delta_t_{delta_t}h"] = {
                            "boundary_elements": len(boundary_data),
                            "columns": list(boundary_data.columns),
                            "has_geometry": hasattr(boundary_data, "geometry"),
                            "statistics": self._calculate_boundary_statistics(
                                boundary_data
                            ),
                        }
                    else:
                        analysis_results["delta_t_analyses"][f"delta_t_{delta_t}h"] = {
                            "error": f"No se pudieron calcular límites para delta_t={delta_t}h"
                        }

                except Exception as e:
                    logger.warning(
                        f"Error en análisis fluvial-pluvial para delta_t={delta_t}h: {e}"
                    )
                    analysis_results["delta_t_analyses"][f"delta_t_{delta_t}h"] = {
                        "error": str(e)
                    }

            # Análisis comparativo
            analysis_results["comparative_analysis"] = (
                self._perform_comparative_fp_analysis(
                    analysis_results["delta_t_analyses"]
                )
            )

            # Estadísticas resumen
            successful_analyses = [
                analysis
                for analysis in analysis_results["delta_t_analyses"].values()
                if "error" not in analysis
            ]

            analysis_results["summary_statistics"] = {
                "total_delta_t_values": len(delta_t_values),
                "successful_analyses": len(successful_analyses),
                "failed_analyses": len(delta_t_values) - len(successful_analyses),
                "analysis_timestamp": datetime.now().isoformat(),
            }

            logger.info(
                f"Análisis fluvial-pluvial avanzado completado: {len(successful_analyses)}/{len(delta_t_values)} exitosos"
            )

            return create_result_dict(
                success=True,
                data=analysis_results,
                message=f"Análisis fluvial-pluvial completado para {len(successful_analyses)} umbrales temporales",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def perform_flood_risk_analysis(
        self, depth_thresholds: List[float] = None
    ) -> Dict[str, Any]:
        """
        Realiza análisis de riesgo de inundación basado en profundidades.

        Args:
            depth_thresholds: Umbrales de profundidad para clasificación de riesgo

        Returns:
            Dict con análisis de riesgo de inundación
        """
        if not self.validation_result["success"]:
            return self.validation_result

        if depth_thresholds is None:
            depth_thresholds = [0.1, 0.5, 1.0, 2.0]  # metros

        try:
            # Obtener datos de profundidad máxima
            max_depth = HdfResultsMesh.get_mesh_max_depth(self.hdf_file_path)

            if max_depth is None or max_depth.empty:
                return create_result_dict(
                    success=False,
                    error="No se encontraron datos de profundidad máxima para análisis de riesgo",
                )

            risk_analysis = {
                "depth_thresholds": depth_thresholds,
                "risk_classification": {},
                "spatial_statistics": {},
                "risk_summary": {},
            }

            # Clasificar riesgo por umbrales de profundidad
            numeric_cols = max_depth.select_dtypes(include=[np.number]).columns
            depth_column = None

            # Buscar columna de profundidad
            for col in numeric_cols:
                if "depth" in col.lower() or "profundidad" in col.lower():
                    depth_column = col
                    break

            if depth_column is None and len(numeric_cols) > 0:
                depth_column = numeric_cols[0]  # Usar la primera columna numérica
                logger.warning(
                    f"No se encontró columna de profundidad específica, usando: {depth_column}"
                )

            if depth_column:
                depths = max_depth[depth_column].dropna()

                # Clasificar por umbrales
                for i, threshold in enumerate(depth_thresholds):
                    risk_level = f"risk_level_{i+1}_above_{threshold}m"
                    count_above_threshold = (depths > threshold).sum()
                    percentage_above = (count_above_threshold / len(depths)) * 100

                    risk_analysis["risk_classification"][risk_level] = {
                        "threshold_m": threshold,
                        "elements_above_threshold": int(count_above_threshold),
                        "percentage_above_threshold": float(percentage_above),
                        "total_elements": len(depths),
                    }

                # Estadísticas espaciales
                risk_analysis["spatial_statistics"] = {
                    "min_depth": float(depths.min()),
                    "max_depth": float(depths.max()),
                    "mean_depth": float(depths.mean()),
                    "median_depth": float(depths.median()),
                    "std_depth": float(depths.std()),
                }

                # Resumen de riesgo
                high_risk_count = (depths > max(depth_thresholds)).sum()
                risk_analysis["risk_summary"] = {
                    "total_flooded_elements": len(depths[depths > 0]),
                    "high_risk_elements": int(high_risk_count),
                    "high_risk_percentage": float(
                        (high_risk_count / len(depths)) * 100
                    ),
                    "analysis_timestamp": datetime.now().isoformat(),
                }

            logger.info(
                f"Análisis de riesgo de inundación completado para {len(depth_thresholds)} umbrales"
            )

            return create_result_dict(
                success=True,
                data=risk_analysis,
                message=f"Análisis de riesgo completado con {len(depth_thresholds)} umbrales de profundidad",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def perform_temporal_analysis(
        self, mesh_name: str, variable: str = "Water Surface"
    ) -> Dict[str, Any]:
        """
        Realiza análisis temporal avanzado de una variable específica.

        Args:
            mesh_name: Nombre de la malla a analizar
            variable: Variable a analizar

        Returns:
            Dict con análisis temporal avanzado
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
                    error=f"No se encontraron datos temporales para {mesh_name} - {variable}",
                )

            temporal_analysis = {
                "basic_info": {
                    "mesh_name": mesh_name,
                    "variable": variable,
                    "time_steps": len(timeseries_data),
                    "data_shape": timeseries_data.shape,
                },
                "temporal_statistics": {},
                "trend_analysis": {},
                "variability_analysis": {},
            }

            # Análisis estadístico temporal
            numeric_cols = timeseries_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                temporal_analysis["temporal_statistics"] = (
                    self._calculate_temporal_statistics(timeseries_data[numeric_cols])
                )

                temporal_analysis["trend_analysis"] = self._analyze_temporal_trends(
                    timeseries_data[numeric_cols]
                )

                temporal_analysis["variability_analysis"] = (
                    self._analyze_temporal_variability(timeseries_data[numeric_cols])
                )

            logger.info(f"Análisis temporal completado para {mesh_name} - {variable}")

            return create_result_dict(
                success=True,
                data=temporal_analysis,
                message=f"Análisis temporal completado para {mesh_name} - {variable}",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def generate_advanced_report(self, output_path: str) -> Dict[str, Any]:
        """
        Genera un reporte de análisis avanzado completo.

        Args:
            output_path: Ruta del archivo de reporte

        Returns:
            Dict con resultado de la generación del reporte
        """
        if not self.validation_result["success"]:
            return self.validation_result

        try:
            # Realizar todos los análisis avanzados
            fp_analysis = self.perform_fluvial_pluvial_analysis()
            risk_analysis = self.perform_flood_risk_analysis()

            # Obtener primera malla para análisis temporal
            mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)
            temporal_analysis = {}
            if mesh_names:
                temporal_analysis = self.perform_temporal_analysis(mesh_names[0])

            # Compilar reporte avanzado
            advanced_report = {
                "report_metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "hdf_file": self.hdf_file_path,
                    "generated_by": "eFlood2 RAS Commander Advanced Analyzer",
                    "version": "0.1.0",
                    "analysis_types": ["fluvial_pluvial", "flood_risk", "temporal"],
                },
                "fluvial_pluvial_analysis": fp_analysis.get("data", {}),
                "flood_risk_analysis": risk_analysis.get("data", {}),
                "temporal_analysis": temporal_analysis.get("data", {}),
                "analysis_summary": {
                    "total_analyses": 3,
                    "successful_analyses": sum(
                        [
                            1
                            for analysis in [
                                fp_analysis,
                                risk_analysis,
                                temporal_analysis,
                            ]
                            if analysis.get("success", False)
                        ]
                    ),
                    "generation_timestamp": datetime.now().isoformat(),
                },
            }

            # Exportar reporte
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(advanced_report, f, indent=2, ensure_ascii=False)

            logger.info(f"Reporte de análisis avanzado generado: {output_path}")

            return create_result_dict(
                success=True,
                data={
                    "report_file": output_path,
                    "file_size_kb": round(os.path.getsize(output_path) / 1024, 2),
                    "analyses_included": advanced_report["analysis_summary"][
                        "successful_analyses"
                    ],
                },
                message=f"Reporte de análisis avanzado generado: {output_path}",
            )

        except Exception as e:
            raise e

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTODOS PRIVADOS DE ANÁLISIS
    # ═══════════════════════════════════════════════════════════════════════════

    def _calculate_boundary_statistics(
        self, boundary_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calcula estadísticas de datos de frontera."""
        try:
            numeric_cols = boundary_data.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats = boundary_data[numeric_cols].describe().to_dict()
                return convert_numpy_types(stats)
            return {}
        except Exception as e:
            return {"error": f"Error calculando estadísticas: {str(e)}"}

    def _perform_comparative_fp_analysis(
        self, delta_t_analyses: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Realiza análisis comparativo entre diferentes umbrales temporales."""
        try:
            successful_analyses = {
                key: analysis
                for key, analysis in delta_t_analyses.items()
                if "error" not in analysis
            }

            if len(successful_analyses) < 2:
                return {
                    "note": "Se necesitan al menos 2 análisis exitosos para comparación"
                }

            # Comparar número de elementos de frontera
            element_counts = {
                key: analysis["boundary_elements"]
                for key, analysis in successful_analyses.items()
            }

            return {
                "element_count_comparison": element_counts,
                "max_elements": max(element_counts.values()) if element_counts else 0,
                "min_elements": min(element_counts.values()) if element_counts else 0,
                "element_count_range": (
                    max(element_counts.values()) - min(element_counts.values())
                    if element_counts
                    else 0
                ),
            }

        except Exception as e:
            return {"error": f"Error en análisis comparativo: {str(e)}"}

    def _calculate_temporal_statistics(
        self, numeric_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Calcula estadísticas temporales avanzadas."""
        try:
            temporal_stats = {}

            for column in numeric_data.columns:
                series = numeric_data[column].dropna()
                if len(series) > 1:
                    temporal_stats[column] = {
                        "mean": float(series.mean()),
                        "std": float(series.std()),
                        "min": float(series.min()),
                        "max": float(series.max()),
                        "range": float(series.max() - series.min()),
                        "coefficient_of_variation": (
                            float(series.std() / series.mean())
                            if series.mean() != 0
                            else 0
                        ),
                    }

            return temporal_stats

        except Exception as e:
            return {"error": f"Error calculando estadísticas temporales: {str(e)}"}

    def _analyze_temporal_trends(self, numeric_data: pd.DataFrame) -> Dict[str, Any]:
        """Analiza tendencias temporales."""
        try:
            trend_analysis = {}

            for column in numeric_data.columns:
                series = numeric_data[column].dropna()
                if len(series) > 2:
                    # Análisis de tendencia simple
                    first_half_mean = series.iloc[: len(series) // 2].mean()
                    second_half_mean = series.iloc[len(series) // 2 :].mean()

                    trend_analysis[column] = {
                        "overall_trend": (
                            "increasing"
                            if second_half_mean > first_half_mean
                            else "decreasing"
                        ),
                        "trend_magnitude": float(
                            abs(second_half_mean - first_half_mean)
                        ),
                        "first_half_mean": float(first_half_mean),
                        "second_half_mean": float(second_half_mean),
                    }

            return trend_analysis

        except Exception as e:
            return {"error": f"Error analizando tendencias: {str(e)}"}

    def _analyze_temporal_variability(
        self, numeric_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Analiza variabilidad temporal."""
        try:
            variability_analysis = {}

            for column in numeric_data.columns:
                series = numeric_data[column].dropna()
                if len(series) > 1:
                    # Calcular diferencias consecutivas
                    differences = series.diff().dropna()

                    variability_analysis[column] = {
                        "mean_change": float(differences.mean()),
                        "std_change": float(differences.std()),
                        "max_increase": float(differences.max()),
                        "max_decrease": float(differences.min()),
                        "stability_index": (
                            float(1 / (1 + differences.std()))
                            if differences.std() > 0
                            else 1.0
                        ),
                    }

            return variability_analysis

        except Exception as e:
            return {"error": f"Error analizando variabilidad: {str(e)}"}


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD PARA USO DIRECTO
# ═══════════════════════════════════════════════════════════════════════════════


@ras_commander_required
@handle_ras_exceptions
def quick_fluvial_pluvial_analysis(
    hdf_file_path: str, delta_t_values: List[int] = None
) -> Dict[str, Any]:
    """
    Análisis rápido fluvial-pluvial avanzado.

    Args:
        hdf_file_path: Ruta al archivo HDF
        delta_t_values: Umbrales temporales

    Returns:
        Dict con análisis fluvial-pluvial
    """
    analyzer = CommanderAdvancedAnalyzer(hdf_file_path)
    return analyzer.perform_fluvial_pluvial_analysis(delta_t_values)


@ras_commander_required
@handle_ras_exceptions
def quick_flood_risk_analysis(
    hdf_file_path: str, depth_thresholds: List[float] = None
) -> Dict[str, Any]:
    """
    Análisis rápido de riesgo de inundación.

    Args:
        hdf_file_path: Ruta al archivo HDF
        depth_thresholds: Umbrales de profundidad

    Returns:
        Dict con análisis de riesgo
    """
    analyzer = CommanderAdvancedAnalyzer(hdf_file_path)
    return analyzer.perform_flood_risk_analysis(depth_thresholds)


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_analysis.
    """
    print("🔬 RAS Commander Advanced Analyzer - Test Mode")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("Uso: python commander_analysis.py <hdf_file_path>")
        return

    hdf_file_path = sys.argv[1]

    # Test del analizador avanzado
    analyzer = CommanderAdvancedAnalyzer(hdf_file_path)

    # Test de análisis fluvial-pluvial
    print("Realizando análisis fluvial-pluvial avanzado...")
    fp_result = analyzer.perform_fluvial_pluvial_analysis([6, 12, 24])
    print(f"Fluvial-Pluvial: {safe_json_serialize(fp_result)}")

    # Test de análisis de riesgo
    print("\nRealizando análisis de riesgo de inundación...")
    risk_result = analyzer.perform_flood_risk_analysis([0.1, 0.5, 1.0])
    print(f"Riesgo: {safe_json_serialize(risk_result)}")


if __name__ == "__main__":
    main()
