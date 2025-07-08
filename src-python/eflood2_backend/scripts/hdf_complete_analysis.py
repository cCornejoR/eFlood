#!/usr/bin/env python3
"""
🔍 Análisis completo de archivo HDF para frontend eFlood
======================================================

Este script ejecuta un análisis completo del archivo HDF y devuelve
los datos en el formato JSON esperado por el frontend.

Uso:
    python hdf_complete_analysis.py <ruta_archivo_hdf>
"""

import json
import logging
import os
import sys
import traceback
from datetime import datetime
from typing import Any, Dict

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def analyze_hdf_complete(hdf_file_path: str) -> Dict[str, Any]:
    """
    Ejecutar análisis completo del archivo HDF.
    
    Args:
        hdf_file_path: Ruta al archivo HDF
        
    Returns:
        Dict con todos los datos extraídos en formato frontend
    """
    try:
        # Verificar que el archivo existe
        if not os.path.exists(hdf_file_path):
            return {
                "success": False,
                "error": f"Archivo no encontrado: {hdf_file_path}"
            }
        
        logger.info(f"Iniciando análisis completo de: {hdf_file_path}")
        
        # Importar módulos necesarios
        from eflood2_backend.integrations.ras_commander.commander_project import CommanderProjectManager
        from eflood2_backend.integrations.ras_commander.commander_geometry import CommanderGeometryProcessor
        from eflood2_backend.integrations.ras_commander.commander_results import CommanderResultsProcessor
        from eflood2_backend.integrations.ras_commander.commander_flow import CommanderFlowAnalyzer
        from eflood2_backend.integrations.ras_commander.commander_infrastructure import CommanderInfrastructureAnalyzer
        
        # Resultado final
        result = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "file_path": hdf_file_path,
            "data": {}
        }
        
        # 1. Análisis de proyecto
        logger.info("1/6 Analizando proyecto...")
        try:
            project_directory = os.path.dirname(hdf_file_path)
            manager = CommanderProjectManager()
            project_result = manager.initialize_project(project_directory)
            
            if project_result["success"]:
                summary = manager.get_project_summary()
                result["data"]["project_analysis"] = summary.get("data", {})
            else:
                result["data"]["project_analysis"] = {
                    "project_type": "hdf_file_only",
                    "hdf_file": hdf_file_path,
                    "note": "Análisis de archivo HDF individual"
                }
        except Exception as e:
            logger.warning(f"Error en análisis de proyecto: {e}")
            result["data"]["project_analysis"] = {"error": str(e)}
        
        # 2. Análisis de geometría y mallas
        logger.info("2/6 Analizando geometría...")
        try:
            geometry_processor = CommanderGeometryProcessor(hdf_file_path)
            mesh_result = geometry_processor.get_mesh_areas_info()
            breaklines_result = geometry_processor.get_breaklines_analysis()
            
            result["data"]["geometry_analysis"] = {
                "mesh_info": mesh_result.get("data", {}),
                "breaklines": breaklines_result.get("data", {}),
                "success": mesh_result.get("success", False) and breaklines_result.get("success", False)
            }
        except Exception as e:
            logger.warning(f"Error en análisis de geometría: {e}")
            result["data"]["geometry_analysis"] = {"error": str(e), "success": False}
        
        # 3. Extracción de valores de Manning
        logger.info("3/6 Extrayendo valores de Manning...")
        try:
            results_processor = CommanderResultsProcessor(hdf_file_path)
            manning_result = results_processor.get_manning_values_analysis()
            
            if manning_result["success"]:
                manning_data = manning_result["data"]
                
                # Formatear datos de Manning para el frontend
                result["data"]["manning_values"] = {
                    "success": True,
                    "data": {
                        "total_zones": manning_data.get("total_manning_zones", 0),
                        "base_values": manning_data.get("base_manning_values", []),
                        "calibration_values": manning_data.get("calibration_manning_values", []),
                        "table_data": manning_data.get("table_data", []),
                        "statistics": {
                            "base_count": len(manning_data.get("base_manning_values", [])),
                            "calibration_count": len(manning_data.get("calibration_manning_values", [])),
                            "base_range": {
                                "min": min(manning_data.get("base_manning_values", [0])),
                                "max": max(manning_data.get("base_manning_values", [0]))
                            } if manning_data.get("base_manning_values") else {"min": 0, "max": 0},
                            "calibration_range": {
                                "min": min(manning_data.get("calibration_manning_values", [0])),
                                "max": max(manning_data.get("calibration_manning_values", [0]))
                            } if manning_data.get("calibration_manning_values") else {"min": 0, "max": 0}
                        }
                    }
                }
            else:
                result["data"]["manning_values"] = {
                    "success": False,
                    "error": manning_result.get("error", "Error extrayendo Manning")
                }
        except Exception as e:
            logger.warning(f"Error extrayendo Manning: {e}")
            result["data"]["manning_values"] = {"success": False, "error": str(e)}
        
        # 4. Análisis de flujo y condiciones de frontera
        logger.info("4/6 Analizando condiciones de flujo...")
        try:
            flow_analyzer = CommanderFlowAnalyzer(hdf_file_path)
            boundary_result = flow_analyzer.get_boundary_conditions_analysis()
            fp_result = flow_analyzer.get_fluvial_pluvial_analysis(12)
            
            result["data"]["flow_analysis"] = {
                "boundary_conditions": boundary_result.get("data", {}),
                "fluvial_pluvial": fp_result.get("data", {}),
                "success": boundary_result.get("success", False) and fp_result.get("success", False)
            }
        except Exception as e:
            logger.warning(f"Error en análisis de flujo: {e}")
            result["data"]["flow_analysis"] = {"error": str(e), "success": False}
        
        # 5. Extracción de hidrogramas
        logger.info("5/6 Extrayendo hidrogramas...")
        try:
            results_processor = CommanderResultsProcessor(hdf_file_path)
            hydrograph_result = results_processor.get_hydrograph_data()
            
            if hydrograph_result["success"]:
                hydro_data = hydrograph_result["data"]
                
                # Formatear datos de hidrograma para el frontend
                result["data"]["hydrograph_data"] = {
                    "success": True,
                    "data": {
                        "mesh_name": hydro_data.get("mesh_name", "Unknown"),
                        "time_series": hydro_data.get("time_series", []),
                        "flow_data": hydro_data.get("flow_data", []),
                        "statistics": {
                            "total_points": len(hydro_data.get("time_series", [])),
                            "flow_range": {
                                "min": min(hydro_data.get("flow_data", [0])),
                                "max": max(hydro_data.get("flow_data", [0]))
                            } if hydro_data.get("flow_data") else {"min": 0, "max": 0},
                            "duration_hours": len(hydro_data.get("time_series", [])) * 0.1667 if hydro_data.get("time_series") else 0  # Asumiendo 10min intervals
                        }
                    }
                }
            else:
                result["data"]["hydrograph_data"] = {
                    "success": False,
                    "error": hydrograph_result.get("error", "Error extrayendo hidrograma")
                }
        except Exception as e:
            logger.warning(f"Error extrayendo hidrograma: {e}")
            result["data"]["hydrograph_data"] = {"success": False, "error": str(e)}
        
        # 6. Análisis de infraestructura
        logger.info("6/6 Analizando infraestructura...")
        try:
            infra_analyzer = CommanderInfrastructureAnalyzer(hdf_file_path)
            infra_result = infra_analyzer.get_comprehensive_infrastructure_analysis()
            
            result["data"]["infrastructure_analysis"] = {
                "data": infra_result.get("data", {}),
                "success": infra_result.get("success", False)
            }
        except Exception as e:
            logger.warning(f"Error en análisis de infraestructura: {e}")
            result["data"]["infrastructure_analysis"] = {"error": str(e), "success": False}
        
        # Resumen final
        successful_analyses = sum(1 for key, value in result["data"].items() 
                                if isinstance(value, dict) and value.get("success", False))
        total_analyses = len(result["data"])
        
        result["summary"] = {
            "total_analyses": total_analyses,
            "successful_analyses": successful_analyses,
            "success_rate": (successful_analyses / total_analyses * 100) if total_analyses > 0 else 0,
            "file_size_mb": round(os.path.getsize(hdf_file_path) / (1024 * 1024), 2),
            "analysis_completed": True
        }
        
        logger.info(f"Análisis completado: {successful_analyses}/{total_analyses} exitosos")
        return result
        
    except Exception as e:
        logger.error(f"Error crítico en análisis: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": f"Error crítico en análisis: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def main():
    """Función principal."""
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Debe proporcionar la ruta del archivo HDF"
        }, indent=2))
        sys.exit(1)
    
    hdf_file_path = sys.argv[1]
    
    # Ejecutar análisis completo
    result = analyze_hdf_complete(hdf_file_path)
    
    # Imprimir resultado como JSON
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))

if __name__ == "__main__":
    main()
