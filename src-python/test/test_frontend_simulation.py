#!/usr/bin/env python3
"""
Simulación exacta del flujo que hace el frontend para verificar que los datos se muestran correctamente
"""

import sys
import os
import json

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

def simulate_frontend_analysis(hdf_file, terrain_file=None):
    """Simular exactamente el flujo del frontend DataAnalyzer"""

    print(f"🎯 SIMULACIÓN EXACTA DEL FRONTEND")
    print(f"📄 HDF: {hdf_file}")
    print(f"🗺️  DTM: {terrain_file}")
    print(f"{'='*80}")

    results = {}

    # Paso 1: read_hdf_file_info
    print("\n1️⃣ Ejecutando: read_hdf_file_info")
    try:
        from hdf_reader import HDFReader
        reader = HDFReader(hdf_file)
        file_info = reader.get_file_info()
        results['file_info'] = file_info
        print(f"   ✅ Info básica extraída")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['file_info'] = {"error": str(e)}

    # Paso 2: get_detailed_hdf_metadata
    print("\n2️⃣ Ejecutando: get_detailed_hdf_metadata")
    try:
        detailed_metadata = reader.get_detailed_metadata()
        results['detailed_metadata'] = detailed_metadata
        print(f"   ✅ Metadatos detallados: {detailed_metadata.get('total_datasets', 0)} datasets")
        print(f"      - Pasos temporales: {detailed_metadata.get('time_steps', 0)}")
        print(f"      - Celdas: {detailed_metadata.get('cell_count', 0)}")
        print(f"      - Áreas de flujo: {detailed_metadata.get('flow_areas', 0)}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['detailed_metadata'] = {"error": str(e)}

    # Paso 3: process_hec_ras_data
    print("\n3️⃣ Ejecutando: process_hec_ras_data")
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python', 'HECRAS-HDF'))
        from hecras_processor import process_hec_ras_data

        hecras_result = process_hec_ras_data(hdf_file, terrain_file)
        results['hecras_processing'] = hecras_result

        if hecras_result.get('success'):
            metadata = hecras_result.get('metadata', {})
            print(f"   ✅ HEC-RAS procesado exitosamente")
            print(f"      - Versión: {metadata.get('file_version', 'Unknown')}")
            print(f"      - Unidades: {metadata.get('units', 'Unknown')}")
            print(f"      - Áreas de flujo: {len(metadata.get('flow_areas', []))}")
            print(f"      - Celdas: {sum(metadata.get('cell_counts', [0]))}")
            print(f"      - Pasos temporales: {metadata.get('solution_times', 0)}")

            boundaries = metadata.get('boundaries', {})
            print(f"      - Condiciones de contorno: {boundaries.get('total', 0)}")
        else:
            print(f"   ⚠️  Error en procesamiento: {hecras_result.get('error', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['hecras_processing'] = {"success": False, "error": str(e)}

    # Paso 4: find_hydraulic_datasets
    print("\n4️⃣ Ejecutando: find_hydraulic_datasets")
    try:
        hydraulic_datasets = reader.find_hydraulic_results()
        results['hydraulic_datasets'] = hydraulic_datasets

        depth_count = len(hydraulic_datasets.get('depth', []))
        velocity_count = len(hydraulic_datasets.get('velocity', []))
        wse_count = len(hydraulic_datasets.get('water_surface', []))

        print(f"   ✅ Datasets hidráulicos encontrados:")
        print(f"      - Profundidad: {depth_count}")
        print(f"      - Velocidad: {velocity_count}")
        print(f"      - Superficie de agua: {wse_count}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['hydraulic_datasets'] = {"error": str(e)}

    # Paso 5: extract_boundary_conditions
    print("\n5️⃣ Ejecutando: extract_boundary_conditions")
    try:
        from boundary_conditions_reader import BoundaryConditionsReader
        bc_reader = BoundaryConditionsReader(hdf_file)
        boundary_conditions = bc_reader.extract_boundary_conditions()
        results['boundary_conditions'] = boundary_conditions

        if boundary_conditions.get('success'):
            total_bc = boundary_conditions.get('total_boundaries', 0)
            print(f"   ✅ Condiciones de contorno: {total_bc} encontradas")

            for bc in boundary_conditions.get('boundary_conditions', [])[:3]:  # Mostrar primeras 3
                print(f"      - {bc.get('name', 'Unknown')}: {bc.get('type', 'Unknown')}")
        else:
            print(f"   ⚠️  Error: {boundary_conditions.get('error', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['boundary_conditions'] = {"success": False, "error": str(e)}

    # Paso 6: extract_manning_values
    print("\n6️⃣ Ejecutando: extract_manning_values")
    try:
        from hecras_processor import extract_manning_table

        manning_result = extract_manning_table(hdf_file, terrain_file)
        results['manning_values'] = manning_result

        if manning_result.get('success'):
            manning_data = manning_result.get('manning_data', {})
            total_zones = manning_data.get('total_zones', 0)
            print(f"   ✅ Valores de Manning: {total_zones} zonas encontradas")
            print(f"      - Tabla mostrada en consola ✓")
        else:
            print(f"   ⚠️  Error: {manning_result.get('error', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        results['manning_values'] = {"success": False, "error": str(e)}

    # Paso 7: Simular la construcción de metadatos para el frontend
    print("\n7️⃣ Construyendo metadatos para el frontend...")
    try:
        # Simular exactamente lo que hace extractAnalysisResults
        frontend_metadata = build_frontend_metadata(results)
        results['frontend_display'] = frontend_metadata

        print(f"   ✅ Metadatos para mostrar en UI:")
        print(f"      📊 Datasets: {frontend_metadata['datasets']}")
        print(f"      ⏱️  Tiempo: {frontend_metadata['time_steps']}")
        print(f"      🔢 Celdas: {frontend_metadata['cells']}")
        print(f"      🌊 Áreas: {frontend_metadata['flow_areas']}")
        print(f"      ⚡ Condiciones de contorno: {frontend_metadata['boundary_conditions']}")
        print(f"      🌿 Zonas de Manning: {frontend_metadata.get('manning_zones', 0)}")

        print(f"\n   📈 Variables disponibles:")
        for var, dims in frontend_metadata['variables'].items():
            print(f"      - {var.capitalize()}: {dims}")

    except Exception as e:
        print(f"   ❌ Error construyendo metadatos: {str(e)}")
        results['frontend_display'] = {"error": str(e)}

    # Resumen final
    print(f"\n{'='*80}")
    print(f"📋 RESUMEN PARA EL FRONTEND")
    print(f"{'='*80}")

    if 'frontend_display' in results and 'error' not in results['frontend_display']:
        display = results['frontend_display']
        print(f"✅ Datos listos para mostrar en la UI:")
        print(f"   - El usuario verá: {display['datasets']} datasets")
        print(f"   - Pasos temporales: {display['time_steps']}")
        print(f"   - Celdas computacionales: {display['cells']}")
        print(f"   - Áreas de flujo 2D: {display['flow_areas']}")
        print(f"   - Condiciones de contorno: {display['boundary_conditions']}")
        print(f"   - Zonas de Manning: {display.get('manning_zones', 0)}")
        print(f"   - Variables: Profundidad ({display['variables']['depth']}), Velocidad ({display['variables']['velocity']}), WSE ({display['variables']['wse']})")

        return True
    else:
        print(f"❌ Hay problemas que impiden mostrar datos correctos en la UI")
        return False

def build_frontend_metadata(results):
    """Construir metadatos exactamente como lo hace el frontend"""

    # Valores por defecto
    metadata = {
        'datasets': 0,
        'time_steps': 0,
        'cells': 0,
        'flow_areas': 0,
        'boundary_conditions': 0,
        'manning_zones': 0,
        'variables': {
            'depth': '0 x 0',
            'velocity': '0 x 0',
            'wse': '0 x 0'
        }
    }

    # Usar metadatos detallados si están disponibles
    if 'detailed_metadata' in results and 'error' not in results['detailed_metadata']:
        detailed = results['detailed_metadata']
        metadata['datasets'] = detailed.get('total_datasets', 0)
        metadata['time_steps'] = detailed.get('time_steps', 0)
        metadata['cells'] = detailed.get('cell_count', 0)
        metadata['flow_areas'] = detailed.get('flow_areas', 0)

    # Usar datos de HEC-RAS si están disponibles
    if 'hecras_processing' in results and results['hecras_processing'].get('success'):
        hecras_meta = results['hecras_processing'].get('metadata', {})

        # Preferir datos de HEC-RAS para algunos valores
        if 'solution_times' in hecras_meta:
            metadata['time_steps'] = hecras_meta['solution_times']

        if 'cell_counts' in hecras_meta:
            metadata['cells'] = sum(hecras_meta['cell_counts'])

        if 'flow_areas' in hecras_meta:
            metadata['flow_areas'] = len(hecras_meta['flow_areas'])

    # Condiciones de contorno
    if 'boundary_conditions' in results and results['boundary_conditions'].get('success'):
        metadata['boundary_conditions'] = results['boundary_conditions'].get('total_boundaries', 0)

    # Valores de Manning
    if 'manning_values' in results and results['manning_values'].get('success'):
        manning_data = results['manning_values'].get('manning_data', {})
        metadata['manning_zones'] = manning_data.get('total_zones', 0)

    # Variables hidráulicas
    if 'hydraulic_datasets' in results and 'error' not in results['hydraulic_datasets']:
        hydraulic = results['hydraulic_datasets']

        depth_count = len(hydraulic.get('depth', []))
        velocity_count = len(hydraulic.get('velocity', []))
        wse_count = len(hydraulic.get('water_surface', []))

        cells = metadata['cells']
        metadata['variables'] = {
            'depth': f"{depth_count} x {cells}",
            'velocity': f"{velocity_count} x {cells}",
            'wse': f"{wse_count} x {cells}"
        }

    return metadata

def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso: python test_frontend_simulation.py <archivo_hdf> [archivo_terreno]")
        sys.exit(1)

    hdf_file = sys.argv[1]
    terrain_file = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.exists(hdf_file):
        print(f"❌ Archivo HDF no encontrado: {hdf_file}")
        sys.exit(1)

    if terrain_file and not os.path.exists(terrain_file):
        print(f"❌ Archivo de terreno no encontrado: {terrain_file}")
        sys.exit(1)

    success = simulate_frontend_analysis(hdf_file, terrain_file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
