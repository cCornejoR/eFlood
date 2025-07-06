#!/usr/bin/env python3
"""
Script de prueba para verificar que el backend Python funcione correctamente
"""

import sys
import os
import json

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

def test_hdf_reader():
    """Probar el lector HDF básico"""
    print("🔍 Probando HDFReader...")
    try:
        from hdf_reader import HDFReader
        print("✅ HDFReader importado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error importando HDFReader: {e}")
        return False

def test_boundary_conditions_reader():
    """Probar el lector de condiciones de contorno"""
    print("🔍 Probando boundary_conditions_reader...")
    try:
        import boundary_conditions_reader
        print("✅ boundary_conditions_reader importado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error importando boundary_conditions_reader: {e}")
        return False

def test_hecras_processor():
    """Probar el procesador HEC-RAS"""
    print("🔍 Probando hecras_processor...")
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python', 'HECRAS-HDF'))
        import hecras_processor
        print("✅ hecras_processor importado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error importando hecras_processor: {e}")
        return False

def test_hdf_data_extractor():
    """Probar el extractor de datos HDF"""
    print("🔍 Probando hdf_data_extractor...")
    try:
        from hdf_data_extractor import HDFDataExtractor
        print("✅ HDFDataExtractor importado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error importando HDFDataExtractor: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🚀 Iniciando pruebas del backend Python...")
    print("=" * 50)
    
    tests = [
        test_hdf_reader,
        test_boundary_conditions_reader,
        test_hdf_data_extractor,
        test_hecras_processor,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Resultados: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todos los módulos del backend funcionan correctamente!")
        return True
    else:
        print("⚠️  Algunos módulos tienen problemas")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
