# 🧪 Tests para Backend RAS Commander

Este directorio contiene todos los tests para el backend RAS Commander de eFlood2.

## 📁 Estructura

```
test/
├── README.md                    # Este archivo
├── pytest.ini                  # Configuración de pytest
└── test_commander_backend.py   # Tests principales para módulos commander_*
```

## 🚀 Ejecutar Tests

### Usando uv (recomendado)

```bash
# Todos los tests
uv run pytest test/test_commander_backend.py -v

# Con información detallada
uv run pytest test/test_commander_backend.py -v --tb=short

# Con duración de tests
uv run pytest test/test_commander_backend.py -v --durations=10

# Solo tests de importación
uv run pytest test/test_commander_backend.py -k "import" -v
```

## 📊 Cobertura de Tests

Los tests cubren:

- ✅ **Importación de módulos**: Verificación de que todos los módulos commander_* se importan correctamente
- ✅ **Funciones utilitarias**: Tests para commander_utils
- ✅ **Gestión de proyectos**: Tests básicos para commander_project
- ✅ **Procesamiento de geometría**: Tests para commander_geometry
- ✅ **Análisis de resultados**: Tests para commander_results
- ✅ **Análisis de flujo**: Tests para commander_flow
- ✅ **Análisis de infraestructura**: Tests para commander_infrastructure
- ✅ **Exportación de datos**: Tests para commander_export
- ✅ **Análisis avanzados**: Tests para commander_analysis
- ✅ **Integración del paquete**: Tests de integración completa

## 🏷️ Marcadores de Tests

Los tests están organizados con marcadores pytest:

- `unit`: Tests unitarios básicos
- `integration`: Tests de integración entre módulos
- `slow`: Tests que tardan más tiempo
- `requires_ras_commander`: Tests que requieren RAS Commander instalado
- `requires_hdf_file`: Tests que requieren archivos HDF reales

### Ejecutar por marcadores

```bash
# Solo tests unitarios
uv run pytest test/test_commander_backend.py -m "unit" -v

# Solo tests de integración
uv run pytest test/test_commander_backend.py -m "integration" -v
```

## 🔧 Configuración

### pytest.ini

El archivo `pytest.ini` contiene la configuración específica para estos tests:

- Patrones de archivos: `test_commander_*.py`
- Configuración de logging
- Marcadores personalizados
- Filtros de warnings

### Fixtures

Los tests utilizan fixtures para:

- `mock_hdf_file`: Archivo HDF temporal para tests
- `mock_output_directory`: Directorio temporal para outputs
- `mock_ras_commander`: Mock de RAS Commander para tests sin dependencias

## 📈 Resultados Esperados

Todos los tests deben pasar:

```
====================== 16 passed in 2.05s ======================
```

### Tests Incluidos

1. **TestCommanderUtils** (5 tests)
   - Importación del módulo
   - Validación de archivos HDF
   - Creación de diccionarios de resultado
   - Conversión de tipos numpy

2. **TestCommanderProject** (2 tests)
   - Importación del módulo
   - Gestión sin RAS Commander

3. **TestCommanderGeometry** (2 tests)
   - Importación del módulo
   - Inicialización del procesador

4. **TestCommanderResults** (1 test)
   - Importación del módulo

5. **TestCommanderFlow** (1 test)
   - Importación del módulo

6. **TestCommanderInfrastructure** (1 test)
   - Importación del módulo

7. **TestCommanderExport** (1 test)
   - Importación del módulo

8. **TestCommanderAnalysis** (1 test)
   - Importación del módulo

9. **TestIntegration** (2 tests)
   - Importación del paquete completo
   - Información del paquete

## 🐛 Troubleshooting

### Error: ModuleNotFoundError

```bash
# Asegúrese de que el entorno esté configurado
uv sync

# Verifique que RAS Commander esté instalado
uv run python -c "import ras_commander; print('OK')"
```

### Error: Tests fallan

```bash
# Ejecutar con más información
uv run pytest test/test_commander_backend.py -v --tb=long

# Verificar configuración
uv run python -c "from eflood2_backend.integrations.ras_commander import get_package_info; print(get_package_info())"
```

## 📝 Agregar Nuevos Tests

Para agregar nuevos tests:

1. **Seguir convención de nomenclatura**: `test_commander_*`
2. **Usar fixtures apropiadas** para setup/teardown
3. **Agregar marcadores** según el tipo de test
4. **Documentar** con docstrings claros
5. **Verificar** que pasen todos los tests existentes

### Ejemplo de nuevo test

```python
class TestCommanderNewFeature:
    """Tests para nueva funcionalidad."""
    
    def test_new_feature_import(self):
        """Test de importación de nueva funcionalidad."""
        from eflood2_backend.integrations.ras_commander import new_feature
        assert new_feature is not None
```

---

**Última actualización**: 2025-01-07  
**Versión**: 0.1.0
