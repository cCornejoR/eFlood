#!/usr/bin/env python3
"""
🏗️ RAS Commander Project Management Module
===========================================

Módulo especializado para la gestión de proyectos HEC-RAS usando RAS Commander.
Proporciona funcionalidades para inicializar, configurar y gestionar proyectos HEC-RAS.

Funcionalidades principales:
- Inicialización de proyectos HEC-RAS
- Gestión de archivos de proyecto (.prj)
- Configuración de planes y geometrías
- Ejecución de simulaciones
- Gestión de múltiples proyectos

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
from typing import Any, Dict, List, Optional, Union

# RAS Commander imports
try:
    from ras_commander import (
        RasCmdr,
        RasExamples,
        RasGeo,
        RasPlan,
        RasPrj,
        RasUnsteady,
        RasUtils,
        init_ras_project,
    )

    RAS_COMMANDER_AVAILABLE = True
except ImportError:
    RAS_COMMANDER_AVAILABLE = False

# Imports locales
from .commander_utils import (
    create_result_dict,
    handle_ras_exceptions,
    logger,
    ras_commander_required,
    safe_json_serialize,
    validate_project_directory,
)

# ═══════════════════════════════════════════════════════════════════════════════
# CLASE PRINCIPAL PARA GESTIÓN DE PROYECTOS
# ═══════════════════════════════════════════════════════════════════════════════


class CommanderProjectManager:
    """
    🏗️ Gestor de proyectos HEC-RAS usando RAS Commander.

    Proporciona una interfaz unificada para la gestión completa de proyectos HEC-RAS,
    incluyendo inicialización, configuración, ejecución y análisis de resultados.
    """

    def __init__(self, project_path: Optional[str] = None, ras_version: str = "6.5"):
        """
        Inicializa el gestor de proyectos.

        Args:
            project_path: Ruta al directorio del proyecto (opcional)
            ras_version: Versión de HEC-RAS a utilizar
        """
        self.project_path = project_path
        self.ras_version = ras_version
        self.ras_project = None
        self.is_initialized = False

        if project_path:
            self.initialize_project(project_path, ras_version)

    @ras_commander_required
    @handle_ras_exceptions
    def initialize_project(
        self, project_path: str, ras_version: str = "6.5"
    ) -> Dict[str, Any]:
        """
        Inicializa un proyecto HEC-RAS usando RAS Commander.

        Args:
            project_path: Ruta al directorio del proyecto
            ras_version: Versión de HEC-RAS

        Returns:
            Dict con resultado de la inicialización
        """
        # Validar directorio del proyecto
        validation_result = validate_project_directory(project_path)
        if not validation_result["success"]:
            return validation_result

        try:
            # Crear instancia de proyecto RAS
            self.ras_project = RasPrj()

            # Inicializar proyecto
            init_ras_project(project_path, ras_version, ras_object=self.ras_project)

            self.project_path = project_path
            self.ras_version = ras_version
            self.is_initialized = True

            # Obtener información del proyecto
            project_info = self._get_project_info()

            logger.info(f"Proyecto HEC-RAS inicializado: {project_path}")

            return create_result_dict(
                success=True,
                data={
                    "project_path": project_path,
                    "ras_version": ras_version,
                    "project_info": project_info,
                    "initialized": True,
                },
                message="Proyecto inicializado exitosamente",
            )

        except Exception as e:
            self.is_initialized = False
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def get_project_summary(self) -> Dict[str, Any]:
        """
        Obtiene un resumen completo del proyecto HEC-RAS.

        Returns:
            Dict con resumen del proyecto
        """
        if not self.is_initialized:
            return create_result_dict(
                success=False,
                error="Proyecto no inicializado. Llame a initialize_project() primero.",
            )

        try:
            summary = {
                "project_path": self.project_path,
                "ras_version": self.ras_version,
                "project_name": getattr(self.ras_project, "project_name", "Unknown"),
                "plans": self._get_plans_info(),
                "geometries": self._get_geometries_info(),
                "flows": self._get_flows_info(),
                "boundaries": self._get_boundaries_info(),
                "hdf_files": self._get_hdf_files_info(),
            }

            return create_result_dict(
                success=True,
                data=summary,
                message="Resumen del proyecto obtenido exitosamente",
            )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def execute_plan(
        self, plan_number: str, dest_folder: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ejecuta un plan específico del proyecto HEC-RAS.

        Args:
            plan_number: Número del plan a ejecutar (ej: "01", "02")
            dest_folder: Carpeta de destino para resultados (opcional)

        Returns:
            Dict con resultado de la ejecución
        """
        if not self.is_initialized:
            return create_result_dict(
                success=False,
                error="Proyecto no inicializado. Llame a initialize_project() primero.",
            )

        try:
            # Configurar carpeta de destino si se especifica
            execution_params = {}
            if dest_folder:
                os.makedirs(dest_folder, exist_ok=True)
                execution_params["dest_folder"] = dest_folder

            # Ejecutar plan usando RAS Commander
            success = RasCmdr.compute_plan(
                plan_number, ras_object=self.ras_project, **execution_params
            )

            if success:
                logger.info(f"Plan {plan_number} ejecutado exitosamente")
                return create_result_dict(
                    success=True,
                    data={
                        "plan_number": plan_number,
                        "execution_successful": True,
                        "dest_folder": dest_folder,
                    },
                    message=f"Plan {plan_number} ejecutado exitosamente",
                )
            else:
                return create_result_dict(
                    success=False, error=f"Fallo en la ejecución del plan {plan_number}"
                )

        except Exception as e:
            raise e

    @ras_commander_required
    @handle_ras_exceptions
    def execute_multiple_plans(
        self, plan_numbers: List[str], parallel: bool = False
    ) -> Dict[str, Any]:
        """
        Ejecuta múltiples planes del proyecto HEC-RAS.

        Args:
            plan_numbers: Lista de números de planes a ejecutar
            parallel: Si ejecutar en paralelo (True) o secuencial (False)

        Returns:
            Dict con resultados de las ejecuciones
        """
        if not self.is_initialized:
            return create_result_dict(
                success=False,
                error="Proyecto no inicializado. Llame a initialize_project() primero.",
            )

        try:
            results = {}

            if parallel:
                # Ejecución en paralelo
                parallel_results = RasCmdr.compute_parallel(
                    plan_number=plan_numbers,
                    ras_object=self.ras_project,
                    max_workers=min(len(plan_numbers), 4),  # Máximo 4 workers
                )
                results = parallel_results
            else:
                # Ejecución secuencial
                for plan_num in plan_numbers:
                    success = RasCmdr.compute_plan(
                        plan_num, ras_object=self.ras_project
                    )
                    results[plan_num] = success

            # Contar éxitos y fallos
            successful_plans = [plan for plan, success in results.items() if success]
            failed_plans = [plan for plan, success in results.items() if not success]

            logger.info(
                f"Ejecución múltiple completada: {len(successful_plans)} éxitos, {len(failed_plans)} fallos"
            )

            return create_result_dict(
                success=len(failed_plans) == 0,
                data={
                    "execution_mode": "parallel" if parallel else "sequential",
                    "total_plans": len(plan_numbers),
                    "successful_plans": successful_plans,
                    "failed_plans": failed_plans,
                    "detailed_results": results,
                },
                message=f"Ejecución múltiple completada: {len(successful_plans)}/{len(plan_numbers)} planes exitosos",
            )

        except Exception as e:
            raise e

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTODOS PRIVADOS DE UTILIDAD
    # ═══════════════════════════════════════════════════════════════════════════

    def _get_project_info(self) -> Dict[str, Any]:
        """Obtiene información básica del proyecto."""
        if not self.ras_project:
            return {}

        return {
            "project_name": getattr(self.ras_project, "project_name", "Unknown"),
            "project_title": getattr(self.ras_project, "project_title", "Unknown"),
            "has_plans": hasattr(self.ras_project, "plan_df")
            and not self.ras_project.plan_df.empty,
            "has_geometries": hasattr(self.ras_project, "geom_df")
            and not self.ras_project.geom_df.empty,
        }

    def _get_plans_info(self) -> Dict[str, Any]:
        """Obtiene información de los planes del proyecto."""
        if not hasattr(self.ras_project, "plan_df") or self.ras_project.plan_df.empty:
            return {"count": 0, "plans": []}

        plans_df = self.ras_project.plan_df
        return {
            "count": len(plans_df),
            "plans": plans_df.to_dict("records") if not plans_df.empty else [],
        }

    def _get_geometries_info(self) -> Dict[str, Any]:
        """Obtiene información de las geometrías del proyecto."""
        if not hasattr(self.ras_project, "geom_df") or self.ras_project.geom_df.empty:
            return {"count": 0, "geometries": []}

        geom_df = self.ras_project.geom_df
        return {
            "count": len(geom_df),
            "geometries": geom_df.to_dict("records") if not geom_df.empty else [],
        }

    def _get_flows_info(self) -> Dict[str, Any]:
        """Obtiene información de los flujos del proyecto."""
        if not hasattr(self.ras_project, "flow_df") or self.ras_project.flow_df.empty:
            return {"count": 0, "flows": []}

        flow_df = self.ras_project.flow_df
        return {
            "count": len(flow_df),
            "flows": flow_df.to_dict("records") if not flow_df.empty else [],
        }

    def _get_boundaries_info(self) -> Dict[str, Any]:
        """Obtiene información de las condiciones de frontera."""
        if (
            not hasattr(self.ras_project, "boundaries_df")
            or self.ras_project.boundaries_df.empty
        ):
            return {"count": 0, "boundaries": []}

        boundaries_df = self.ras_project.boundaries_df
        return {
            "count": len(boundaries_df),
            "boundaries": (
                boundaries_df.to_dict("records") if not boundaries_df.empty else []
            ),
        }

    def _get_hdf_files_info(self) -> Dict[str, Any]:
        """Obtiene información de los archivos HDF del proyecto."""
        try:
            hdf_entries = self.ras_project.get_hdf_entries()
            if hdf_entries is not None and not hdf_entries.empty:
                return {
                    "count": len(hdf_entries),
                    "hdf_files": hdf_entries.to_dict("records"),
                }
        except:
            pass

        return {"count": 0, "hdf_files": []}


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD PARA USO DIRECTO
# ═══════════════════════════════════════════════════════════════════════════════


@ras_commander_required
@handle_ras_exceptions
def quick_project_init(project_path: str, ras_version: str = "6.5") -> Dict[str, Any]:
    """
    Inicialización rápida de un proyecto HEC-RAS.

    Args:
        project_path: Ruta al directorio del proyecto
        ras_version: Versión de HEC-RAS

    Returns:
        Dict con resultado de la inicialización
    """
    manager = CommanderProjectManager()
    return manager.initialize_project(project_path, ras_version)


@ras_commander_required
@handle_ras_exceptions
def get_example_projects() -> Dict[str, Any]:
    """
    Obtiene lista de proyectos de ejemplo disponibles en RAS Commander.

    Returns:
        Dict con información de proyectos de ejemplo
    """
    try:
        ras_examples = RasExamples()
        categories = ras_examples.list_categories()

        example_info = {"categories": categories, "projects_by_category": {}}

        for category in categories:
            projects = ras_examples.list_projects(category)
            example_info["projects_by_category"][category] = projects

        return create_result_dict(
            success=True,
            data=example_info,
            message="Proyectos de ejemplo obtenidos exitosamente",
        )

    except Exception as e:
        raise e


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIÓN PRINCIPAL PARA TESTING
# ═══════════════════════════════════════════════════════════════════════════════


def main():
    """
    Función principal para testing del módulo commander_project.
    """
    print("🏗️ RAS Commander Project Manager - Test Mode")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("Uso: python commander_project.py <project_path> [ras_version]")
        print("\nEjemplos de uso:")
        print("  python commander_project.py /path/to/project")
        print("  python commander_project.py /path/to/project 6.5")
        return

    project_path = sys.argv[1]
    ras_version = sys.argv[2] if len(sys.argv) > 2 else "6.5"

    # Test de inicialización de proyecto
    manager = CommanderProjectManager()
    result = manager.initialize_project(project_path, ras_version)
    print(f"Inicialización: {safe_json_serialize(result)}")

    if result["success"]:
        # Test de resumen del proyecto
        summary = manager.get_project_summary()
        print(f"\nResumen del proyecto: {safe_json_serialize(summary)}")


if __name__ == "__main__":
    main()
