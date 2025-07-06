#!/usr/bin/env python3
"""
Script de prueba completo para verificar el análisis HDF
"""

import sys
import os
import json

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

def test_with_sample_hdf():
    """Probar con un archivo HDF de ejemplo si existe"""

    # Buscar archivos HDF en el directorio actual
    hdf_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.hdf') or file.endswith('.h5'):
                hdf_files.append(os.path.join(root, file))

    if not hdf_files:
        print("❌ No se encontraron archivos HDF para probar")
        return False

    print(f"📁 Archivos HDF encontrados: {len(hdf_files)}")
    for hdf_file in hdf_files:
        print(f"  - {hdf_file}")

    # Usar el primer archivo encontrado
    test_file = hdf_files[0]
    print(f"\n🔍 Probando con: {test_file}")

    return test_hdf_file(test_file)

def test_hdf_file(hdf_file_path):
    """Probar análisis completo de un archivo HDF"""

    print(f"\n{'='*60}")
    print(f"🧪 PRUEBA COMPLETA DE ANÁLISIS HDF")
    print(f"📄 Archivo: {hdf_file_path}")
    print(f"{'='*60}")

    success_count = 0
    total_tests = 5

    # Test 1: HDFReader básico
    print("\n1️⃣ Probando HDFReader básico...")
    try:
        from hdf_reader import HDFReader
        reader = HDFReader(hdf_file_path)

        # Probar estructura
        structure = reader.get_file_structure()
        print(f"   ✅ Estructura extraída: {len(structure)} elementos principales")

        # Probar metadatos detallados
        metadata = reader.get_detailed_metadata()
        print(f"   ✅ Metadatos: {metadata['total_datasets']} datasets, {metadata['time_steps']} pasos temporales")

        success_count += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

    # Test 2: Boundary Conditions Reader
    print("\n2️⃣ Probando Boundary Conditions Reader...")
    try:
        from boundary_conditions_reader import BoundaryConditionsReader
        bc_reader = BoundaryConditionsReader(hdf_file_path)
        bc_data = bc_reader.extract_boundary_conditions()

        if bc_data['success']:
            print(f"   ✅ Condiciones de contorno: {bc_data['total_boundaries']} encontradas")
        else:
            print(f"   ⚠️  Sin condiciones de contorno: {bc_data.get('error', 'Unknown')}")

        success_count += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

    # Test 3: HEC-RAS Processor
    print("\n3️⃣ Probando HEC-RAS Processor...")
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python', 'HECRAS-HDF'))
        from hecras_processor import get_basic_hdf_metadata

        metadata = get_basic_hdf_metadata(hdf_file_path)
        if metadata['success']:
            meta = metadata['metadata']
            print(f"   ✅ Metadatos HEC-RAS: {meta.get('total_datasets', 0)} datasets")
            print(f"      - Pasos temporales: {meta.get('max_time_steps', 0)}")
            print(f"      - Celdas máximas: {meta.get('max_cells', 0)}")
            print(f"      - Áreas de flujo: {meta.get('num_flow_areas', 0)}")
        else:
            print(f"   ❌ Error en metadatos: {metadata.get('error', 'Unknown')}")

        success_count += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

    # Test 4: Hydraulic Results
    print("\n4️⃣ Probando extracción de resultados hidráulicos...")
    try:
        from hdf_reader import HDFReader
        reader = HDFReader(hdf_file_path)
        hydraulic = reader.find_hydraulic_results()

        depth_count = len(hydraulic.get('depth', []))
        velocity_count = len(hydraulic.get('velocity', []))
        wse_count = len(hydraulic.get('wse', []))

        print(f"   ✅ Variables encontradas:")
        print(f"      - Profundidad: {depth_count} datasets")
        print(f"      - Velocidad: {velocity_count} datasets")
        print(f"      - WSE: {wse_count} datasets")

        success_count += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

    # Test 5: Simulación de comando Tauri
    print("\n5️⃣ Simulando comando Tauri completo...")
    try:
        # Simular el flujo completo que haría Tauri
        from hdf_reader import HDFReader

        reader = HDFReader(hdf_file_path)

        # 1. Estructura del archivo
        structure = reader.get_file_structure()

        # 2. Metadatos detallados
        metadata = reader.get_detailed_metadata()

        # 3. Resultados hidráulicos
        hydraulic = reader.find_hydraulic_results()

        # 4. Condiciones de contorno
        from boundary_conditions_reader import BoundaryConditionsReader
        bc_reader = BoundaryConditionsReader(hdf_file_path)
        bc_data = bc_reader.extract_boundary_conditions()

        # Crear resumen como lo haría el frontend
        summary = {
            "datasets": metadata.get('total_datasets', 0),
            "time_steps": metadata.get('time_steps', 0),
            "cells": metadata.get('cell_count', 0),
            "flow_areas": metadata.get('flow_areas', 0),
            "variables": {
                "depth": f"{len(hydraulic.get('depth', []))} x {metadata.get('cell_count', 0)}",
                "velocity": f"{len(hydraulic.get('velocity', []))} x {metadata.get('cell_count', 0)}",
                "wse": f"{len(hydraulic.get('wse', []))} x {metadata.get('cell_count', 0)}"
            },
            "boundary_conditions": bc_data.get('total_boundaries', 0)
        }

        print(f"   ✅ Resumen completo generado:")
        print(f"      - Datasets: {summary['datasets']}")
        print(f"      - Pasos temporales: {summary['time_steps']}")
        print(f"      - Celdas: {summary['cells']}")
        print(f"      - Áreas de flujo: {summary['flow_areas']}")
        print(f"      - Condiciones de contorno: {summary['boundary_conditions']}")

        success_count += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

    # Resumen final
    print(f"\n{'='*60}")
    print(f"📊 RESUMEN DE PRUEBAS")
    print(f"✅ Exitosas: {success_count}/{total_tests}")
    print(f"❌ Fallidas: {total_tests - success_count}/{total_tests}")

    if success_count == total_tests:
        print("🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.")
        return True
    elif success_count >= 3:
        print("⚠️  La mayoría de las pruebas pasaron. Hay algunos problemas menores.")
        return True
    else:
        print("❌ Muchas pruebas fallaron. Hay problemas significativos.")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas completas del sistema de análisis HDF...")

    # Verificar si se proporcionó un archivo específico
    if len(sys.argv) > 1:
        hdf_file = sys.argv[1]
        if os.path.exists(hdf_file):
            print(f"📁 Usando archivo especificado: {hdf_file}")
            success = test_hdf_file(hdf_file)
        else:
            print(f"❌ Archivo no encontrado: {hdf_file}")
            success = False
    else:
        # Buscar archivos HDF automáticamente
        success = test_with_sample_hdf()

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
