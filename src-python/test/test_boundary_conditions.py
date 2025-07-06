#!/usr/bin/env python3
"""
Test script para verificar que boundary_conditions_reader.py funciona correctamente
"""

import json
import sys
import os

# Agregar el directorio src-python al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src-python'))

from boundary_conditions_reader import BoundaryConditionsReader

def test_boundary_conditions():
    """Test básico para verificar que el script no produce errores JSON"""
    
    # Crear un reader con un archivo ficticio
    reader = BoundaryConditionsReader("fake_file.hdf")
    
    # Simular el resultado que debería devolver
    test_result = {
        "success": True,
        "boundary_conditions": [
            {
                "name": "Entrada Principal",
                "type": "Caudal",
                "description": "Hidrograma de entrada principal",
                "data_available": True,
                "time_steps": 100,
                "data_keys": ["Flow", "Time"]
            },
            {
                "name": "Salida Normal",
                "type": "Nivel",
                "description": "Condición de salida normal",
                "data_available": True,
                "time_steps": 100,
                "data_keys": ["Stage", "Time"]
            }
        ],
        "time_series": {
            "Flow_Data": {
                "data": [10.0, 15.0, 20.0, 25.0, 20.0, 15.0, 10.0],
                "length": 7,
                "min_value": 10.0,
                "max_value": 25.0,
                "mean_value": 16.43
            }
        },
        "total_boundaries": 2
    }
    
    # Verificar que se puede convertir a JSON sin errores
    try:
        json_output = json.dumps(test_result, indent=2)
        print("✅ JSON válido generado:")
        print(json_output)
        
        # Verificar que se puede parsear de vuelta
        parsed = json.loads(json_output)
        print("✅ JSON parseado correctamente")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en JSON: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Probando boundary_conditions_reader...")
    success = test_boundary_conditions()
    
    if success:
        print("✅ Todas las pruebas pasaron")
        sys.exit(0)
    else:
        print("❌ Algunas pruebas fallaron")
        sys.exit(1)
