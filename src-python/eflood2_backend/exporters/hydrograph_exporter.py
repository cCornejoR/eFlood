#!/usr/bin/env python3
"""
Exportador de Hidrogramas para eFlood2
Extrae y exporta datos de hidrogramas desde archivos HDF5 de HEC-RAS
"""

import sys
import json
import os
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional
import h5py
import numpy as np

# Import utilities
from ..utils.common import setup_logging, validate_file_path, format_error_message

# Configure logging
logger = setup_logging()

class HydrographExporter:
    """Exportador de datos de hidrogramas desde archivos HDF5"""

    def __init__(self, hdf_file_path: str):
        """
        Inicializar exportador

        Args:
            hdf_file_path (str): Ruta al archivo HDF5
        """
        self.hdf_file_path = Path(hdf_file_path)
        if not self.hdf_file_path.exists():
            raise FileNotFoundError(f"Archivo HDF no encontrado: {hdf_file_path}")

    def extract_hydrograph_data(self, boundary_conditions: List[str]) -> Dict[str, Any]:
        """
        Extraer datos de hidrograma para condiciones de contorno específicas

        Args:
            boundary_conditions (List[str]): Lista de condiciones de contorno

        Returns:
            Dict con datos de hidrograma
        """
        hydrograph_data = {}

        try:
            with h5py.File(self.hdf_file_path, 'r') as f:
                # Buscar datos de condiciones de contorno
                for bc_name in boundary_conditions:
                    bc_data = self._find_boundary_condition_data(f, bc_name)
                    if bc_data:
                        hydrograph_data[bc_name] = bc_data

        except Exception as e:
            raise Exception(f"Error extrayendo datos de hidrograma: {str(e)}")

        return hydrograph_data

    def _find_boundary_condition_data(self, hdf_file, bc_name: str) -> Optional[Dict[str, Any]]:
        """
        Buscar datos de una condición de contorno específica

        Args:
            hdf_file: Archivo HDF5 abierto
            bc_name (str): Nombre de la condición de contorno

        Returns:
            Dict con datos de la condición de contorno o None
        """
        try:
            # Buscar en diferentes ubicaciones posibles
            search_paths = [
                f"Event Conditions/Unsteady/Boundary Conditions/{bc_name}",
                f"Boundary Conditions/{bc_name}",
                f"Results/Unsteady/Boundary Conditions/{bc_name}",
            ]

            for path in search_paths:
                if path in hdf_file:
                    group = hdf_file[path]

                    # Extraer datos de caudal y tiempo
                    flow_data = None
                    time_data = None
                    stage_data = None

                    # Buscar datasets de caudal
                    for key in group.keys():
                        if 'flow' in key.lower() or 'discharge' in key.lower():
                            flow_data = group[key][:]
                        elif 'time' in key.lower():
                            time_data = group[key][:]
                        elif 'stage' in key.lower() or 'elevation' in key.lower():
                            stage_data = group[key][:]

                    # Si no encontramos tiempo, crear array de tiempo sintético
                    if flow_data is not None and time_data is None:
                        time_data = np.arange(len(flow_data))

                    if flow_data is not None:
                        return {
                            'time': time_data.tolist() if time_data is not None else [],
                            'flow': flow_data.tolist(),
                            'stage': stage_data.tolist() if stage_data is not None else [],
                            'units': {
                                'time': 'hours',
                                'flow': 'cms',
                                'stage': 'm'
                            }
                        }

        except Exception as e:
            print(f"Error buscando datos para {bc_name}: {str(e)}")

        return None

    def export_to_csv(self, hydrograph_data: Dict[str, Any], output_path: str) -> bool:
        """
        Exportar datos de hidrograma a CSV

        Args:
            hydrograph_data (Dict): Datos de hidrograma
            output_path (str): Ruta de salida

        Returns:
            bool: True si exitoso
        """
        try:
            # Crear DataFrame combinado
            all_data = []

            for bc_name, data in hydrograph_data.items():
                if 'time' in data and 'flow' in data:
                    for i, (time, flow) in enumerate(zip(data['time'], data['flow'])):
                        row = {
                            'Boundary_Condition': bc_name,
                            'Time_Hours': time,
                            'Flow_CMS': flow,
                        }

                        # Agregar datos de nivel si están disponibles
                        if 'stage' in data and i < len(data['stage']):
                            row['Stage_M'] = data['stage'][i]

                        all_data.append(row)

            if all_data:
                df = pd.DataFrame(all_data)
                df.to_csv(output_path, index=False)
                return True

        except Exception as e:
            print(f"Error exportando a CSV: {str(e)}")

        return False

    def export_to_excel(self, hydrograph_data: Dict[str, Any], output_path: str) -> bool:
        """
        Exportar datos de hidrograma a Excel

        Args:
            hydrograph_data (Dict): Datos de hidrograma
            output_path (str): Ruta de salida

        Returns:
            bool: True si exitoso
        """
        try:
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                # Crear hoja para cada condición de contorno
                for bc_name, data in hydrograph_data.items():
                    if 'time' in data and 'flow' in data:
                        df_data = {
                            'Time_Hours': data['time'],
                            'Flow_CMS': data['flow'],
                        }

                        if 'stage' in data and data['stage']:
                            df_data['Stage_M'] = data['stage']

                        df = pd.DataFrame(df_data)

                        # Limpiar nombre de hoja (Excel tiene restricciones)
                        sheet_name = bc_name.replace('/', '_').replace('\\', '_')[:31]
                        df.to_excel(writer, sheet_name=sheet_name, index=False)

                # Crear hoja de resumen
                summary_data = []
                for bc_name, data in hydrograph_data.items():
                    if 'flow' in data:
                        summary_data.append({
                            'Boundary_Condition': bc_name,
                            'Max_Flow_CMS': max(data['flow']) if data['flow'] else 0,
                            'Min_Flow_CMS': min(data['flow']) if data['flow'] else 0,
                            'Avg_Flow_CMS': np.mean(data['flow']) if data['flow'] else 0,
                            'Data_Points': len(data['flow']) if data['flow'] else 0,
                        })

                if summary_data:
                    summary_df = pd.DataFrame(summary_data)
                    summary_df.to_excel(writer, sheet_name='Summary', index=False)

            return True

        except Exception as e:
            print(f"Error exportando a Excel: {str(e)}")

        return False


def main():
    """Interfaz de línea de comandos"""
    if len(sys.argv) < 5:
        print(json.dumps({
            "success": False,
            "error": "Usage: python hydrograph_exporter.py export_hydrograph <hdf_file> <output_path> <format> [boundary_conditions...]"
        }))
        sys.exit(1)

    command = sys.argv[1]
    hdf_file = sys.argv[2]
    output_path = sys.argv[3]
    format_type = sys.argv[4]
    boundary_conditions = sys.argv[5:] if len(sys.argv) > 5 else []

    try:
        if command == "export_hydrograph":
            exporter = HydrographExporter(hdf_file)

            # Extraer datos
            hydrograph_data = exporter.extract_hydrograph_data(boundary_conditions)

            if not hydrograph_data:
                print(json.dumps({
                    "success": False,
                    "error": "No se encontraron datos de hidrograma para las condiciones especificadas"
                }))
                sys.exit(1)

            # Exportar según formato
            success = False
            if format_type.lower() == 'csv':
                success = exporter.export_to_csv(hydrograph_data, output_path)
            elif format_type.lower() in ['excel', 'xlsx']:
                success = exporter.export_to_excel(hydrograph_data, output_path)
            else:
                print(json.dumps({
                    "success": False,
                    "error": f"Formato no soportado: {format_type}"
                }))
                sys.exit(1)

            if success:
                print(json.dumps({
                    "success": True,
                    "output_file": output_path,
                    "boundary_conditions": boundary_conditions,
                    "format": format_type,
                    "data_summary": {
                        bc: len(data.get('flow', [])) for bc, data in hydrograph_data.items()
                    }
                }))
            else:
                print(json.dumps({
                    "success": False,
                    "error": "Error durante la exportación"
                }))
        else:
            print(json.dumps({
                "success": False,
                "error": f"Comando no reconocido: {command}"
            }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Error: {str(e)}"
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
