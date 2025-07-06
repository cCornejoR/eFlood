#!/usr/bin/env python3
"""
Test completo del backend para verificar que todos los scripts funcionan correctamente
"""

import json
import sys
import os

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

def test_boundary_conditions(hdf_file):
    """Test de extracción de condiciones de contorno"""
    print("🔍 Probando extracción de condiciones de contorno...")

    try:
        from boundary_conditions_reader import BoundaryConditionsReader

        reader = BoundaryConditionsReader(hdf_file)
        result = reader.extract_boundary_conditions()

        # Verificar que el resultado es JSON válido
        json_output = json.dumps(result, indent=2)
        parsed = json.loads(json_output)

        print(f"✅ Condiciones de contorno extraídas exitosamente")
        print(f"   - Total de condiciones: {result.get('total_boundaries', 0)}")
        print(f"   - Condiciones encontradas: {len(result.get('boundary_conditions', []))}")

        # Mostrar las condiciones encontradas
        for i, bc in enumerate(result.get('boundary_conditions', [])[:3]):  # Solo las primeras 3
            print(f"   - {i+1}. {bc.get('name', 'Sin nombre')} ({bc.get('type', 'Desconocido')})")

        return True, result

    except Exception as e:
        print(f"❌ Error en condiciones de contorno: {str(e)}")
        return False, None

def test_hdf_structure(hdf_file):
    """Test de lectura de estructura HDF"""
    print("🔍 Probando lectura de estructura HDF...")

    try:
        from hdf_reader import HDFReader

        reader = HDFReader(hdf_file)
        structure = reader.get_file_structure()

        print(f"✅ Estructura HDF leída exitosamente")
        print(f"   - Grupos principales: {len(structure)}")

        # Mostrar algunos grupos principales
        for i, group in enumerate(list(structure.keys())[:5]):  # Solo los primeros 5
            print(f"   - {i+1}. {group}")

        return True, structure

    except Exception as e:
        print(f"❌ Error en estructura HDF: {str(e)}")
        return False, None

def test_json_safety(data):
    """Test de seguridad JSON"""
    print("🔍 Probando seguridad JSON...")

    try:
        # Convertir a JSON y parsear de vuelta
        json_str = json.dumps(data, indent=2)
        parsed_data = json.loads(json_str)

        print("✅ JSON es seguro y válido")
        return True

    except Exception as e:
        print(f"❌ Error en JSON: {str(e)}")
        return False

def main():
    """Función principal de prueba"""
    hdf_file = r"D:\01_INGENIERIA\2_PROYECTOS\04_AMPHOS21\941_OHLA\2. MH_PUENTE_SAYAN\HY7782-PD_CP_PUENTE.p01.hdf"

    print("🧪 PRUEBA COMPLETA DEL BACKEND")
    print("=" * 50)
    print(f"📁 Archivo HDF: {os.path.basename(hdf_file)}")
    print()

    # Verificar que el archivo existe
    if not os.path.exists(hdf_file):
        print(f"❌ El archivo HDF no existe: {hdf_file}")
        return False

    print("✅ Archivo HDF encontrado")
    print()

    # Test 1: Condiciones de contorno
    bc_success, bc_result = test_boundary_conditions(hdf_file)
    print()

    # Test 2: Estructura HDF
    struct_success, struct_result = test_hdf_structure(hdf_file)
    print()

    # Test 3: Seguridad JSON
    if bc_success and bc_result:
        json_success = test_json_safety(bc_result)
    else:
        json_success = False
    print()

    # Resumen
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 30)
    print(f"Condiciones de contorno: {'✅' if bc_success else '❌'}")
    print(f"Estructura HDF: {'✅' if struct_success else '❌'}")
    print(f"Seguridad JSON: {'✅' if json_success else '❌'}")
    print()

    if bc_success and struct_success and json_success:
        print("🎉 TODAS LAS PRUEBAS PASARON")
        print("El backend está funcionando correctamente")
        return True
    else:
        print("⚠️  ALGUNAS PRUEBAS FALLARON")
        print("Revisa los errores arriba")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
