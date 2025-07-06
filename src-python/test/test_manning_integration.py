#!/usr/bin/env python3
"""
Test de integración para verificar que los valores de Manning se extraen correctamente
y tienen la estructura esperada por el frontend
"""

import json
import sys
import os

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

def test_manning_extraction(hdf_file):
    """Test de extracción de valores de Manning"""
    print("🌿 Probando extracción de valores de Manning...")

    try:
        from manning_extractor import ManningExtractor

        extractor = ManningExtractor(hdf_file)
        result = extractor.extract_manning_values()

        # Verificar que el resultado es JSON válido
        json_output = json.dumps(result, indent=2)
        parsed = json.loads(json_output)

        print(f"✅ Valores de Manning extraídos exitosamente")

        if result.get('success'):
            manning_data = result.get('manning_data', {})
            total_zones = manning_data.get('total_zones', 0)
            manning_zones = manning_data.get('manning_zones', {})

            print(f"   - Total de zonas: {total_zones}")
            print(f"   - Estructura correcta: {'✅' if manning_data.get('success') else '❌'}")

            # Mostrar algunas zonas de ejemplo
            print("   - Zonas encontradas:")
            for i, (zone_id, zone_data) in enumerate(list(manning_zones.items())[:5]):
                name = zone_data.get('name', 'Sin nombre')
                value = zone_data.get('value', 0)
                print(f"     {i+1}. Zona {zone_id}: {name} (n={value:.4f})")

            if total_zones > 5:
                print(f"     ... y {total_zones - 5} zonas más")

            return True, result
        else:
            print(f"❌ Error: {result.get('error', 'Error desconocido')}")
            return False, None

    except Exception as e:
        print(f"❌ Error en extracción de Manning: {str(e)}")
        return False, None

def test_frontend_compatibility(manning_result):
    """Test de compatibilidad con el frontend"""
    print("🔍 Probando compatibilidad con frontend...")

    try:
        # Simular la estructura que espera el frontend
        expected_structure = {
            "success": True,
            "manning_data": {
                "success": True,
                "manning_zones": {},
                "total_zones": 0,
                "table_data": [],
                "formatted_table": ""
            },
            "table_printed": True
        }

        # Verificar que la estructura coincide
        if not manning_result.get('success'):
            print("❌ Resultado no exitoso")
            return False

        manning_data = manning_result.get('manning_data', {})
        if not manning_data.get('success'):
            print("❌ Manning data no exitoso")
            return False

        required_fields = ['manning_zones', 'total_zones', 'table_data', 'formatted_table']
        for field in required_fields:
            if field not in manning_data:
                print(f"❌ Campo faltante: {field}")
                return False

        print("✅ Estructura compatible con frontend")
        print(f"   - Campos requeridos: ✅")
        print(f"   - Formato JSON válido: ✅")
        print(f"   - Datos de zonas: {len(manning_data.get('manning_zones', {}))}")

        return True

    except Exception as e:
        print(f"❌ Error en compatibilidad: {str(e)}")
        return False

def main():
    """Función principal de prueba"""
    hdf_file = r"D:\01_INGENIERIA\2_PROYECTOS\04_AMPHOS21\941_OHLA\2. MH_PUENTE_SAYAN\HY7782-PD_CP_PUENTE.p01.hdf"

    print("🧪 PRUEBA DE INTEGRACIÓN - VALORES DE MANNING")
    print("=" * 60)
    print(f"📁 Archivo HDF: {os.path.basename(hdf_file)}")
    print()

    # Verificar que el archivo existe
    if not os.path.exists(hdf_file):
        print(f"❌ El archivo HDF no existe: {hdf_file}")
        return False

    print("✅ Archivo HDF encontrado")
    print()

    # Test 1: Extracción de Manning
    manning_success, manning_result = test_manning_extraction(hdf_file)
    print()

    # Test 2: Compatibilidad con frontend
    if manning_success and manning_result:
        frontend_success = test_frontend_compatibility(manning_result)
    else:
        frontend_success = False
    print()

    # Resumen
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 30)
    print(f"Extracción de Manning: {'✅' if manning_success else '❌'}")
    print(f"Compatibilidad Frontend: {'✅' if frontend_success else '❌'}")
    print()

    if manning_success and frontend_success:
        print("🎉 TODAS LAS PRUEBAS PASARON")
        print("Los valores de Manning deberían mostrarse correctamente en el frontend")

        # Mostrar estructura final
        if manning_result:
            print("\n📋 ESTRUCTURA FINAL PARA EL FRONTEND:")
            print("-" * 40)
            manning_data = manning_result.get('manning_data', {})
            print(f"Total de zonas: {manning_data.get('total_zones', 0)}")
            print(f"Zonas disponibles: {len(manning_data.get('manning_zones', {}))}")
            print(f"Datos de tabla: {len(manning_data.get('table_data', []))}")
            print(f"Tabla formateada: {'✅' if manning_data.get('formatted_table') else '❌'}")

        return True
    else:
        print("⚠️  ALGUNAS PRUEBAS FALLARON")
        print("Revisa los errores arriba")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
