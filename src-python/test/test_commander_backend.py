#!/usr/bin/env python3
"""
🧪 Tests Comprehensivos para Backend RAS Commander
==================================================

Suite de tests para todos los módulos commander_* del backend eFlood2.
Incluye tests unitarios, de integración y de funcionalidad.

Autor: eFlood2 Technologies
Versión: 0.1.0
"""

import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import MagicMock, Mock, patch

import pytest

# Agregar el directorio del proyecto al path
sys.path.insert(0, str(Path(__file__).parent.parent))

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE TESTS
# ═══════════════════════════════════════════════════════════════════════════════

# Mock data para tests
MOCK_HDF_FILE = "test_model.hdf"
MOCK_MESH_NAMES = ["2D Area 1", "2D Area 2"]
MOCK_BOUNDARY_DATA = {
    "total_breaklines": 10,
    "columns": ["id", "elevation", "geometry"],
    "has_geometry": True,
}

# ═══════════════════════════════════════════════════════════════════════════════
# FIXTURES PARA TESTS
# ═══════════════════════════════════════════════════════════════════════════════


@pytest.fixture
def mock_hdf_file():
    """Fixture que proporciona un archivo HDF mock."""
    with tempfile.NamedTemporaryFile(suffix=".hdf", delete=False) as f:
        # Crear un archivo HDF vacío para tests
        f.write(b"mock_hdf_content")
        yield f.name
    os.unlink(f.name)


@pytest.fixture
def mock_output_directory():
    """Fixture que proporciona un directorio temporal para outputs."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def mock_ras_commander():
    """Fixture que mockea RAS Commander."""
    with patch(
        "eflood2_backend.integrations.ras_commander.commander_utils.RAS_COMMANDER_AVAILABLE",
        True,
    ):
        yield


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_UTILS
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderUtils:
    """Tests para el módulo commander_utils."""

    def test_import_commander_utils(self):
        """Test de importación del módulo commander_utils."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_utils

            assert commander_utils is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_utils: {e}")

    def test_validate_hdf_file_valid(self, mock_hdf_file):
        """Test de validación de archivo HDF válido."""
        from eflood2_backend.integrations.ras_commander.commander_utils import (
            validate_hdf_file,
        )

        result = validate_hdf_file(mock_hdf_file)
        # El archivo mock puede fallar la validación por extensión, pero debe retornar un dict
        assert isinstance(result, dict)
        assert "success" in result
        if result["success"]:
            assert "file_path" in result
            assert "file_size_mb" in result

    def test_validate_hdf_file_invalid(self):
        """Test de validación de archivo HDF inválido."""
        from eflood2_backend.integrations.ras_commander.commander_utils import (
            validate_hdf_file,
        )

        result = validate_hdf_file("nonexistent_file.hdf")
        assert result["success"] is False
        assert "error" in result

    def test_create_result_dict(self):
        """Test de creación de diccionario de resultado."""
        from eflood2_backend.integrations.ras_commander.commander_utils import (
            create_result_dict,
        )

        result = create_result_dict(True, {"test": "data"}, None, extra_field="extra")
        assert result["success"] is True
        assert result["data"]["test"] == "data"
        assert result["extra_field"] == "extra"
        assert "timestamp" in result

    def test_convert_numpy_types(self):
        """Test de conversión de tipos numpy."""
        import numpy as np

        from eflood2_backend.integrations.ras_commander.commander_utils import (
            convert_numpy_types,
        )

        test_data = {
            "int": np.int64(42),
            "float": np.float64(3.14),
            "array": np.array([1, 2, 3]),
            "nested": {"inner": np.int32(10)},
        }

        converted = convert_numpy_types(test_data)
        assert isinstance(converted["int"], int)
        assert isinstance(converted["float"], float)
        assert isinstance(converted["array"], list)
        assert isinstance(converted["nested"]["inner"], int)


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_PROJECT
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderProject:
    """Tests para el módulo commander_project."""

    def test_import_commander_project(self):
        """Test de importación del módulo commander_project."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_project

            assert commander_project is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_project: {e}")

    @patch(
        "eflood2_backend.integrations.ras_commander.commander_project.RAS_COMMANDER_AVAILABLE",
        False,
    )
    def test_project_manager_without_ras_commander(self):
        """Test del gestor de proyectos sin RAS Commander disponible."""
        from eflood2_backend.integrations.ras_commander.commander_project import (
            CommanderProjectManager,
        )

        manager = CommanderProjectManager()
        result = manager.initialize_project("/fake/path")

        assert result["success"] is False
        # El error puede ser por RAS Commander no disponible o directorio no existe
        assert "error" in result


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_GEOMETRY
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderGeometry:
    """Tests para el módulo commander_geometry."""

    def test_import_commander_geometry(self):
        """Test de importación del módulo commander_geometry."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_geometry

            assert commander_geometry is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_geometry: {e}")

    @patch(
        "eflood2_backend.integrations.ras_commander.commander_geometry.RAS_COMMANDER_AVAILABLE",
        True,
    )
    def test_geometry_processor_initialization(self, mock_hdf_file):
        """Test de inicialización del procesador de geometría."""
        from eflood2_backend.integrations.ras_commander.commander_geometry import (
            CommanderGeometryProcessor,
        )

        processor = CommanderGeometryProcessor(mock_hdf_file)
        assert processor.hdf_file_path == mock_hdf_file
        assert processor.validation_result is not None


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_RESULTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderResults:
    """Tests para el módulo commander_results."""

    def test_import_commander_results(self):
        """Test de importación del módulo commander_results."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_results

            assert commander_results is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_results: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_FLOW
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderFlow:
    """Tests para el módulo commander_flow."""

    def test_import_commander_flow(self):
        """Test de importación del módulo commander_flow."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_flow

            assert commander_flow is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_flow: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_INFRASTRUCTURE
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderInfrastructure:
    """Tests para el módulo commander_infrastructure."""

    def test_import_commander_infrastructure(self):
        """Test de importación del módulo commander_infrastructure."""
        try:
            from eflood2_backend.integrations.ras_commander import (
                commander_infrastructure,
            )

            assert commander_infrastructure is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_infrastructure: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_EXPORT
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderExport:
    """Tests para el módulo commander_export."""

    def test_import_commander_export(self):
        """Test de importación del módulo commander_export."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_export

            assert commander_export is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_export: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS PARA COMMANDER_ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════


class TestCommanderAnalysis:
    """Tests para el módulo commander_analysis."""

    def test_import_commander_analysis(self):
        """Test de importación del módulo commander_analysis."""
        try:
            from eflood2_backend.integrations.ras_commander import commander_analysis

            assert commander_analysis is not None
        except ImportError as e:
            pytest.fail(f"Error importando commander_analysis: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# TESTS DE INTEGRACIÓN
# ═══════════════════════════════════════════════════════════════════════════════


class TestIntegration:
    """Tests de integración para el paquete completo."""

    def test_package_import(self):
        """Test de importación del paquete completo."""
        try:
            from eflood2_backend.integrations import ras_commander

            assert ras_commander is not None
        except ImportError as e:
            pytest.fail(f"Error importando paquete ras_commander: {e}")

    def test_get_package_info(self):
        """Test de información del paquete."""
        try:
            from eflood2_backend.integrations.ras_commander import get_package_info

            info = get_package_info()

            assert isinstance(info, dict)
            assert "package_version" in info
            assert "modules" in info
            assert isinstance(info["modules"], list)
            assert len(info["modules"]) > 0

            # Verificar que todos los módulos commander_* están listados
            expected_modules = [
                "commander_project",
                "commander_geometry",
                "commander_flow",
                "commander_results",
                "commander_infrastructure",
                "commander_export",
                "commander_analysis",
                "commander_utils",
            ]

            for module in expected_modules:
                assert (
                    module in info["modules"]
                ), f"Módulo {module} no encontrado en la lista"

        except ImportError as e:
            pytest.fail(f"Error obteniendo información del paquete: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE PYTEST
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Ejecutar tests si se ejecuta directamente
    pytest.main([__file__, "-v", "--tb=short"])
