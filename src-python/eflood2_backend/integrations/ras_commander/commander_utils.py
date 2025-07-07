#!/usr/bin/env python3
"""
🔧 RAS Commander Utilities Module
==================================

Utilidades específicas para la integración con RAS Commander en eFlood2.
Proporciona funciones comunes, validaciones y configuraciones para todos los módulos commander_*.

Funcionalidades principales:
- Validación de archivos HEC-RAS
- Configuración de logging específico
- Manejo de errores estandarizado
- Utilidades de conversión de datos
- Funciones de validación de parámetros

Autor: eFlood2 Technologies
Versión: 0.1.0
Última actualización: 2025-01-07
"""

# ═══════════════════════════════════════════════════════════════════════════════
# IMPORTS Y CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

import json
import logging
import os
import sys
import traceback
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# Imports científicos
import numpy as np
import pandas as pd

# RAS Commander imports
try:
    from ras_commander import RasPrj, init_ras_project

    RAS_COMMANDER_AVAILABLE = True
except ImportError:
    RAS_COMMANDER_AVAILABLE = False

# eFlood2 utilities
from ...utils.common import format_error_message, setup_logging, validate_file_path

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

logger = setup_logging()

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTES Y CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

# Extensiones de archivos HEC-RAS soportadas
HECRAS_FILE_EXTENSIONS = {
    "hdf": [".hdf", ".h5", ".hdf5"],
    "project": [".prj"],
    "plan": [".p01", ".p02", ".p03", ".p04", ".p05"],
    "geometry": [".g01", ".g02", ".g03", ".g04", ".g05"],
    "flow": [".f01", ".f02", ".f03", ".f04", ".f05"],
    "unsteady": [".u01", ".u02", ".u03", ".u04", ".u05"],
}

# Configuración por defecto para RAS Commander
DEFAULT_RAS_CONFIG = {
    "ras_version": "6.5",
    "timeout_seconds": 300,
    "max_retries": 3,
    "log_level": "INFO",
}

# ═══════════════════════════════════════════════════════════════════════════════
# DECORADORES PARA MANEJO DE ERRORES
# ═══════════════════════════════════════════════════════════════════════════════


def ras_commander_required(func):
    """
    Decorador que verifica si RAS Commander está disponible antes de ejecutar la función.

    Args:
        func: Función a decorar

    Returns:
        Función decorada con verificación de RAS Commander
    """

    def wrapper(*args, **kwargs):
        if not RAS_COMMANDER_AVAILABLE:
            error_msg = "RAS Commander no está disponible. Instale con: pip install ras-commander"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "error_type": "dependency_missing",
            }
        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper


def handle_ras_exceptions(func):
    """
    Decorador para manejo estandarizado de excepciones en funciones RAS Commander.

    Args:
        func: Función a decorar

    Returns:
        Función decorada con manejo de excepciones
    """

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_msg = f"Error en {func.__name__}: {str(e)}"
            logger.error(error_msg)
            logger.debug(f"Traceback completo: {traceback.format_exc()}")

            return {
                "success": False,
                "error": error_msg,
                "error_type": type(e).__name__,
                "function": func.__name__,
                "timestamp": datetime.now().isoformat(),
            }

    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE VALIDACIÓN
# ═══════════════════════════════════════════════════════════════════════════════


def validate_hdf_file(file_path: str) -> Dict[str, Any]:
    """
    Valida un archivo HDF de HEC-RAS.

    Args:
        file_path: Ruta al archivo HDF

    Returns:
        Dict con resultado de validación
    """
    try:
        validated_path = validate_file_path(file_path, HECRAS_FILE_EXTENSIONS["hdf"])

        # Verificar que el archivo no esté vacío
        file_size = os.path.getsize(validated_path)
        if file_size == 0:
            return {
                "success": False,
                "error": f"El archivo HDF está vacío: {validated_path}",
            }

        return {
            "success": True,
            "file_path": validated_path,
            "file_size_mb": round(file_size / (1024 * 1024), 2),
            "file_exists": True,
        }

    except Exception as e:
        return {"success": False, "error": f"Error validando archivo HDF: {str(e)}"}


def validate_project_directory(project_path: str) -> Dict[str, Any]:
    """
    Valida un directorio de proyecto HEC-RAS.

    Args:
        project_path: Ruta al directorio del proyecto

    Returns:
        Dict con resultado de validación
    """
    try:
        if not os.path.exists(project_path):
            return {
                "success": False,
                "error": f"Directorio de proyecto no existe: {project_path}",
            }

        if not os.path.isdir(project_path):
            return {
                "success": False,
                "error": f"La ruta no es un directorio: {project_path}",
            }

        # Buscar archivos de proyecto HEC-RAS
        project_files = {}
        for root, dirs, files in os.walk(project_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_ext = os.path.splitext(file)[1].lower()

                for file_type, extensions in HECRAS_FILE_EXTENSIONS.items():
                    if file_ext in extensions:
                        if file_type not in project_files:
                            project_files[file_type] = []
                        project_files[file_type].append(file_path)

        return {
            "success": True,
            "project_path": project_path,
            "project_files": project_files,
            "has_hdf": len(project_files.get("hdf", [])) > 0,
            "has_project": len(project_files.get("project", [])) > 0,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error validando directorio de proyecto: {str(e)}",
        }


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE CONVERSIÓN Y UTILIDADES
# ═══════════════════════════════════════════════════════════════════════════════


def convert_numpy_types(obj: Any) -> Any:
    """
    Convierte tipos numpy a tipos Python nativos para serialización JSON.

    Args:
        obj: Objeto a convertir

    Returns:
        Objeto convertido a tipos Python nativos
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj


def safe_json_serialize(data: Any) -> str:
    """
    Serializa datos a JSON de forma segura, manejando tipos numpy.

    Args:
        data: Datos a serializar

    Returns:
        String JSON
    """
    try:
        converted_data = convert_numpy_types(data)
        return json.dumps(converted_data, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error en serialización JSON: {e}")
        return json.dumps({"error": f"Error de serialización: {str(e)}"})


def create_result_dict(
    success: bool, data: Any = None, error: str = None, **kwargs
) -> Dict[str, Any]:
    """
    Crea un diccionario de resultado estandarizado.

    Args:
        success: Indica si la operación fue exitosa
        data: Datos del resultado (opcional)
        error: Mensaje de error (opcional)
        **kwargs: Campos adicionales

    Returns:
        Dict con resultado estandarizado
    """
    result = {"success": success, "timestamp": datetime.now().isoformat()}

    if data is not None:
        result["data"] = data

    if error is not None:
        result["error"] = error

    # Agregar campos adicionales
    result.update(kwargs)

    return result


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════


def get_ras_commander_info() -> Dict[str, Any]:
    """
    Obtiene información sobre la instalación de RAS Commander.

    Returns:
        Dict con información de RAS Commander
    """
    info = {"available": RAS_COMMANDER_AVAILABLE, "version": None, "modules": []}

    if RAS_COMMANDER_AVAILABLE:
        try:
            import ras_commander

            info["version"] = getattr(ras_commander, "__version__", "unknown")

            # Listar módulos disponibles
            available_modules = []
            module_names = [
                "RasPrj",
                "RasCmdr",
                "RasPlan",
                "RasGeo",
                "RasUnsteady",
                "HdfBase",
                "HdfMesh",
                "HdfResultsMesh",
                "HdfBndry",
                "HdfStruc",
            ]

            for module_name in module_names:
                if hasattr(ras_commander, module_name):
                    available_modules.append(module_name)

            info["modules"] = available_modules

        except Exception as e:
            info["error"] = f"Error obteniendo información de RAS Commander: {str(e)}"

    return info


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_utils.
    """
    print("🔧 RAS Commander Utilities - Test Mode")
    print("=" * 50)

    # Mostrar información de RAS Commander
    ras_info = get_ras_commander_info()
    print(f"RAS Commander Info: {safe_json_serialize(ras_info)}")

    # Test de validación de archivos (si se proporciona un archivo)
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        print(f"\nValidando archivo: {test_file}")
        validation_result = validate_hdf_file(test_file)
        print(f"Resultado: {safe_json_serialize(validation_result)}")


if __name__ == "__main__":
    main()
