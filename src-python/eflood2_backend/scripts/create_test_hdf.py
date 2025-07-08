#!/usr/bin/env python3
"""
🧪 Script para crear un archivo HDF de prueba para testing del Analyzer+
"""

import h5py
import numpy as np
from pathlib import Path

def create_test_hdf():
    """Crear un archivo HDF de prueba con estructura básica de HEC-RAS"""
    
    test_file = Path("test_hecras_model.hdf")
    
    print(f"🔧 Creando archivo HDF de prueba: {test_file}")
    
    with h5py.File(test_file, 'w') as f:
        # Crear estructura básica de HEC-RAS compatible con RAS Commander

        # Grupo de geometría
        geom_group = f.create_group("Geometry")

        # Información de mallas 2D
        mesh_group = geom_group.create_group("2D Flow Areas")
        area1 = mesh_group.create_group("2D Area 1")

        # Agregar atributos necesarios para RAS Commander
        area1.attrs["Name"] = "2D Area 1"
        area1.attrs["Type"] = "2D Flow Area"

        # Datos de celdas (simulados)
        cells_x = np.random.uniform(0, 1000, 500)
        cells_y = np.random.uniform(0, 1000, 500)
        area1.create_dataset("Cells Center Coordinate", data=np.column_stack([cells_x, cells_y]))

        # Agregar grupo de atributos que espera RAS Commander
        attrs_group = f.create_group("Attributes")
        attrs_group.attrs["File Type"] = "HEC-RAS Results"
        attrs_group.attrs["File Version"] = "5.0.7"
        
        # Grupo de resultados
        results_group = f.create_group("Results")
        unsteady_group = results_group.create_group("Unsteady")
        output_group = unsteady_group.create_group("Output")
        output_blocks = output_group.create_group("Output Blocks")
        
        # Datos de profundidad (simulados)
        base_block = output_blocks.create_group("Base Output Interval")
        unsteady_ts = base_block.create_group("Unsteady Time Series")
        areas_2d = unsteady_ts.create_group("2D Flow Areas")
        area1_results = areas_2d.create_group("2D Area 1")
        
        # Crear datos de profundidad para 10 pasos de tiempo
        time_steps = 10
        n_cells = 500
        depth_data = np.random.uniform(0, 5, (time_steps, n_cells))
        area1_results.create_dataset("Depth", data=depth_data)
        
        # Datos de velocidad
        velocity_data = np.random.uniform(0, 2, (time_steps, n_cells))
        area1_results.create_dataset("Face Velocity", data=velocity_data)
        
        # Tiempos de simulación
        times = np.arange(0, time_steps * 3600, 3600)  # Cada hora
        unsteady_group.create_dataset("Time Date Stamp", data=times)
        
        # Información de plan
        plan_group = f.create_group("Plan Data")
        plan_info = plan_group.create_group("Plan Information")
        plan_info.attrs["Plan Name"] = "Test Plan"
        plan_info.attrs["Plan Short ID"] = "p01"
        
        print("✅ Archivo HDF de prueba creado exitosamente")
        print(f"📁 Ubicación: {test_file.absolute()}")
        
        return str(test_file.absolute())

if __name__ == "__main__":
    create_test_hdf()
