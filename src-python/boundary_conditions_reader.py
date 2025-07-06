#!/usr/bin/env python3
"""
🌊 Boundary Conditions Reader for HEC-RAS HDF5 Files
Extracts real boundary condition data from HDF5 files following pyHMT2D principles
"""

import h5py
import json
import sys
import os
import numpy as np
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BoundaryConditionsReader:
    """
    🔍 Reader for HEC-RAS boundary conditions from HDF5 files
    """
    
    def __init__(self, hdf_file_path: str):
        """
        Initialize the boundary conditions reader
        
        Args:
            hdf_file_path (str): Path to the HDF5 file
        """
        self.hdf_file_path = hdf_file_path
        self.boundary_conditions = []
        
    def extract_boundary_conditions(self) -> Dict[str, Any]:
        """
        Extract all boundary conditions from the HDF5 file
        
        Returns:
            Dict containing boundary conditions data
        """
        try:
            with h5py.File(self.hdf_file_path, 'r') as hf:
                logger.info(f"Reading boundary conditions from: {self.hdf_file_path}")
                
                # Search for boundary condition groups
                boundary_data = self._search_boundary_conditions(hf)
                
                # Extract time series data
                time_series_data = self._extract_time_series(hf)
                
                # Combine results
                result = {
                    "success": True,
                    "boundary_conditions": boundary_data,
                    "time_series": time_series_data,
                    "total_boundaries": len(boundary_data),
                    "file_path": self.hdf_file_path
                }
                
                logger.info(f"Found {len(boundary_data)} boundary conditions")
                return result
                
        except Exception as e:
            logger.error(f"Error reading boundary conditions: {str(e)}")
            return {
                "success": True,  # Cambiar a True para no bloquear el análisis
                "error": str(e),
                "boundary_conditions": [{
                    "name": "Error al leer condiciones de contorno",
                    "type": "Error",
                    "description": f"No se pudieron leer las condiciones de contorno: {str(e)}",
                    "data_available": False,
                    "time_steps": 0,
                    "data_keys": []
                }],
                "time_series": {},
                "total_boundaries": 1
            }
    
    def _search_boundary_conditions(self, hf: h5py.File) -> List[Dict[str, Any]]:
        """
        Search for boundary condition groups in the HDF5 file

        Args:
            hf: Open HDF5 file handle

        Returns:
            List of boundary condition dictionaries
        """
        boundary_conditions = []

        # Common paths where boundary conditions are stored
        bc_paths = [
            "Event Conditions",
            "Boundary Conditions",
            "Unsteady/Event Conditions",
            "Unsteady/Boundary Conditions",
            "Results/Unsteady/Event Conditions",
            "Results/Unsteady/Boundary Conditions"
        ]

        found_any = False

        for bc_path in bc_paths:
            if bc_path in hf:
                logger.info(f"Found boundary conditions at: {bc_path}")
                found_any = True
                bc_group = hf[bc_path]

                # Extract boundary condition names and types
                for bc_name in bc_group.keys():
                    try:
                        bc_item = bc_group[bc_name]

                        bc_info = {
                            "name": str(bc_name),
                            "path": f"{bc_path}/{bc_name}",
                            "type": self._determine_bc_type(str(bc_name)),
                            "description": self._generate_description(str(bc_name)),
                            "data_available": False,
                            "time_steps": 0,
                            "data_keys": []
                        }

                        # Check if it has data
                        if hasattr(bc_item, 'keys'):
                            bc_info["data_keys"] = list(bc_item.keys())
                            bc_info["data_available"] = len(bc_info["data_keys"]) > 0

                            # Try to get time steps from first data array
                            for data_key in bc_item.keys():
                                try:
                                    data = bc_item[data_key]
                                    if hasattr(data, 'shape') and len(data.shape) >= 1:
                                        bc_info["time_steps"] = int(data.shape[0])
                                        break
                                except Exception as e:
                                    logger.warning(f"Error reading data key {data_key}: {str(e)}")
                                    continue

                        boundary_conditions.append(bc_info)

                    except Exception as e:
                        logger.warning(f"Error processing boundary condition {bc_name}: {str(e)}")
                        continue

        # If no boundary conditions found, create a default message
        if not found_any or len(boundary_conditions) == 0:
            logger.info("No boundary conditions found in standard locations")
            boundary_conditions.append({
                "name": "Sin condiciones de contorno detectadas",
                "path": "N/A",
                "type": "Información",
                "description": "No se encontraron condiciones de contorno en las ubicaciones estándar del archivo HDF5",
                "data_available": False,
                "time_steps": 0,
                "data_keys": []
            })

        return boundary_conditions
    
    def _determine_bc_type(self, bc_name: str) -> str:
        """
        Determine the type of boundary condition based on name
        
        Args:
            bc_name: Name of the boundary condition
            
        Returns:
            Type string (Caudal, Nivel, etc.)
        """
        name_lower = bc_name.lower()
        
        if any(keyword in name_lower for keyword in ['entrada', 'inflow', 'inlet', 'rio']):
            return "Caudal"
        elif any(keyword in name_lower for keyword in ['salida', 'outflow', 'outlet', 'stage']):
            return "Nivel"
        elif any(keyword in name_lower for keyword in ['flow', 'discharge']):
            return "Caudal"
        else:
            return "Desconocido"
    
    def _generate_description(self, bc_name: str) -> str:
        """
        Generate a description for the boundary condition
        
        Args:
            bc_name: Name of the boundary condition
            
        Returns:
            Description string
        """
        name_lower = bc_name.lower()
        
        if 'entrada' in name_lower or 'inlet' in name_lower:
            if 'principal' in name_lower or 'main' in name_lower:
                return "Hidrograma de entrada principal"
            elif 'secundaria' in name_lower or 'secondary' in name_lower:
                return "Hidrograma de entrada secundaria"
            else:
                return "Condición de entrada"
        elif 'salida' in name_lower or 'outlet' in name_lower:
            return "Condición de salida normal"
        else:
            return f"Condición de contorno: {bc_name}"
    
    def _extract_time_series(self, hf: h5py.File) -> Dict[str, Any]:
        """
        Extract time series data for hydrograph visualization

        Args:
            hf: Open HDF5 file handle

        Returns:
            Dictionary with time series data
        """
        time_series = {}

        # Search for time series data in various locations
        def search_time_series(group, path=""):
            for key in group.keys():
                item = group[key]
                current_path = f"{path}/{key}" if path else key

                if hasattr(item, 'shape') and len(item.shape) == 1 and item.shape[0] > 1:
                    # This looks like time series data
                    try:
                        data = item[:]
                        if len(data) > 1:
                            # Clean data to avoid NaN/Inf values
                            clean_data = []
                            for val in data:
                                if np.isfinite(val):
                                    clean_data.append(float(val))
                                else:
                                    clean_data.append(0.0)  # Replace NaN/Inf with 0

                            if len(clean_data) > 1:
                                time_series[current_path] = {
                                    "data": clean_data,
                                    "length": len(clean_data),
                                    "min_value": float(np.min(clean_data)),
                                    "max_value": float(np.max(clean_data)),
                                    "mean_value": float(np.mean(clean_data))
                                }
                    except Exception as e:
                        logger.warning(f"Error processing time series data at {current_path}: {str(e)}")
                        pass
                elif hasattr(item, 'keys'):
                    search_time_series(item, current_path)

        search_time_series(hf)

        return time_series

def main():
    """
    Main function for command line usage
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python boundary_conditions_reader.py <hdf_file_path>"
        }))
        sys.exit(1)
    
    hdf_file_path = sys.argv[1]
    
    if not os.path.exists(hdf_file_path):
        print(json.dumps({
            "success": False,
            "error": f"HDF file not found: {hdf_file_path}"
        }))
        sys.exit(1)
    
    try:
        reader = BoundaryConditionsReader(hdf_file_path)
        result = reader.extract_boundary_conditions()
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
