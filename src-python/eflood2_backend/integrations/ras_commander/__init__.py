#!/usr/bin/env python3
"""
🚀 RAS Commander Integration Package for eFlood2
==================================================

Este paquete contiene módulos especializados para la integración con RAS Commander,
siguiendo la convención de nomenclatura commander_* para todos los módulos.

Módulos disponibles:
- commander_project: Gestión de proyectos HEC-RAS
- commander_geometry: Procesamiento de geometría y mallas
- commander_flow: Análisis de flujo y condiciones de frontera
- commander_results: Procesamiento de resultados y análisis
- commander_infrastructure: Análisis de infraestructura
- commander_export: Exportación avanzada de datos
- commander_analysis: Análisis especializados
- commander_utils: Utilidades específicas de RAS Commander

Autor: eFlood2 Technologies
Versión: 0.1.0
"""

# ═══════════════════════════════════════════════════════════════════════════════
# IMPORTS Y CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

import logging
from typing import Any, Dict, Optional

# Verificar disponibilidad de RAS Commander
try:
    import ras_commander

    RAS_COMMANDER_AVAILABLE = True
    RAS_COMMANDER_VERSION = getattr(ras_commander, "__version__", "unknown")
except ImportError:
    RAS_COMMANDER_AVAILABLE = False
    RAS_COMMANDER_VERSION = None

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DEL PAQUETE
# ═══════════════════════════════════════════════════════════════════════════════

__version__ = "0.1.0"
__author__ = "eFlood2 Technologies"
__email__ = "team@eflood2.com"

# Configurar logging para el paquete
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD DEL PAQUETE
# ═══════════════════════════════════════════════════════════════════════════════


def get_package_info() -> Dict[str, Any]:
    """
    Obtiene información sobre el paquete RAS Commander integration.

    Returns:
        Dict con información del paquete y estado de RAS Commander
    """
    return {
        "package_version": __version__,
        "ras_commander_available": RAS_COMMANDER_AVAILABLE,
        "ras_commander_version": RAS_COMMANDER_VERSION,
        "modules": [
            "commander_project",
            "commander_geometry",
            "commander_flow",
            "commander_results",
            "commander_infrastructure",
            "commander_export",
            "commander_analysis",
            "commander_utils",
        ],
    }


def check_ras_commander_availability() -> bool:
    """
    Verifica si RAS Commander está disponible.

    Returns:
        True si RAS Commander está disponible, False en caso contrario
    """
    if not RAS_COMMANDER_AVAILABLE:
        logger.warning(
            "RAS Commander no está disponible. Instale con: pip install ras-commander"
        )
        return False

    logger.info(f"RAS Commander {RAS_COMMANDER_VERSION} disponible")
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# IMPORTS DE MÓDULOS COMMANDER_*
# ═══════════════════════════════════════════════════════════════════════════════

# Importar módulos solo si RAS Commander está disponible
if RAS_COMMANDER_AVAILABLE:
    try:
        from . import (
            commander_analysis,
            commander_export,
            commander_flow,
            commander_geometry,
            commander_infrastructure,
            commander_project,
            commander_results,
            commander_utils,
        )

        logger.info("Todos los módulos commander_* importados exitosamente")

    except ImportError as e:
        logger.warning(f"Error importando módulos commander_*: {e}")
        # Los módulos individuales manejarán sus propios errores de importación

# ═══════════════════════════════════════════════════════════════════════════════
# EXPORTS PÚBLICOS
# ═══════════════════════════════════════════════════════════════════════════════

__all__ = [
    # Información del paquete
    "__version__",
    "__author__",
    "__email__",
    "get_package_info",
    "check_ras_commander_availability",
    "RAS_COMMANDER_AVAILABLE",
    "RAS_COMMANDER_VERSION",
    # Módulos commander_* (si están disponibles)
    "commander_utils",
    "commander_project",
    "commander_geometry",
    "commander_flow",
    "commander_results",
    "commander_infrastructure",
    "commander_export",
    "commander_analysis",
]
