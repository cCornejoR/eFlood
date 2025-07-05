#!/usr/bin/env python3
"""
Script para crear un archivo HDF de prueba y verificar la funcionalidad
"""

import h5py
import numpy as np
import tempfile
import os
import sys

def create_test_hdf():
    """Crear un archivo HDF de prueba"""
    # Crear archivo temporal
    temp_file = tempfile.NamedTemporaryFile(suffix='.hdf', delete=False)
    temp_file.close()

    try:
        # Crear archivo HDF con datos de prueba
        with h5py.File(temp_file.name, 'w') as f:
            # Crear grupos simulando estructura HEC-RAS
            results_group = f.create_group('Results')
            unsteady_group = results_group.create_group('Unsteady')
            output_group = unsteady_group.create_group('Output')

            # Crear datasets de prueba
            times = np.array([0.0, 3600.0, 7200.0, 10800.0])  # 4 time steps
            depths = np.random.uniform(0.5, 3.0, (100, 4))  # 100 cells, 4 times
            velocities = np.random.uniform(0.1, 2.0, (100, 4))

            output_group.create_dataset('Output Times', data=times)
            output_group.create_dataset('2D Flow Areas/Area_01/Depth', data=depths)
            output_group.create_dataset('2D Flow Areas/Area_01/Velocity', data=velocities)

            # Agregar metadatos
            f.attrs['Title'] = 'Test HDF File for eFlow'
            f.attrs['Program'] = 'HEC-RAS'
            f.attrs['Version'] = '6.0'

        return temp_file.name

    except Exception as e:
        os.unlink(temp_file.name)
        raise e

def test_hdf_reader(hdf_file):
    """Probar el lector HDF"""
    print(f"Probando hdf_reader.py con archivo: {hdf_file}")

    import subprocess

    # Test 1: Información del archivo
    print("\n1. Probando comando 'info':")
    result = subprocess.run([
        'uv', 'run', 'python', 'hdf_reader.py', hdf_file, 'info'
    ], capture_output=True, text=True)

    if result.returncode == 0:
        print("✓ Comando 'info' ejecutado correctamente")
        print("Salida:", result.stdout[:200] + "..." if len(result.stdout) > 200 else result.stdout)
    else:
        print("✗ Error en comando 'info':", result.stderr)
        return False

    # Test 2: Estructura del archivo
    print("\n2. Probando comando 'structure':")
    result = subprocess.run([
        'uv', 'run', 'python', 'hdf_reader.py', hdf_file, 'structure'
    ], capture_output=True, text=True)

    if result.returncode == 0:
        print("✓ Comando 'structure' ejecutado correctamente")
        print("Salida:", result.stdout[:200] + "..." if len(result.stdout) > 200 else result.stdout)
    else:
        print("✗ Error en comando 'structure':", result.stderr)
        return False

    # Test 3: Datos hidráulicos
    print("\n3. Probando comando 'hydraulic':")
    result = subprocess.run([
        'uv', 'run', 'python', 'hdf_reader.py', hdf_file, 'hydraulic'
    ], capture_output=True, text=True)

    if result.returncode == 0:
        print("✓ Comando 'hydraulic' ejecutado correctamente")
        print("Salida:", result.stdout[:200] + "..." if len(result.stdout) > 200 else result.stdout)
    else:
        print("✗ Error en comando 'hydraulic':", result.stderr)
        return False

    return True

def main():
    """Función principal"""
    print("=== PRUEBA COMPLETA DE INTEGRACIÓN HDF ===\n")

    try:
        # Crear archivo HDF de prueba
        print("Creando archivo HDF de prueba...")
        hdf_file = create_test_hdf()
        print(f"✓ Archivo HDF creado: {hdf_file}")

        # Probar el lector
        if test_hdf_reader(hdf_file):
            print("\n🎉 TODAS LAS PRUEBAS HDF PASARON")
            print("La integración Python-Tauri está funcionando correctamente!")
            return 0
        else:
            print("\n❌ ALGUNAS PRUEBAS HDF FALLARON")
            return 1

    except Exception as e:
        print(f"✗ Error durante las pruebas: {e}")
        return 1

    finally:
        # Limpiar archivo temporal
        if 'hdf_file' in locals():
            try:
                os.unlink(hdf_file)
                print(f"\n🧹 Archivo temporal eliminado: {hdf_file}")
            except:
                pass

if __name__ == "__main__":
    sys.exit(main())
