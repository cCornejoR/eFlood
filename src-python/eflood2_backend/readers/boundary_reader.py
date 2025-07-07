"""
Unified Boundary Conditions Reader for HEC-RAS HDF5 Files
Combines functionality from boundary_conditions_reader and enhanced_boundary_conditions_reader
Extracts boundary condition data from HDF5 files following pyHMT2D principles
"""

import h5py
import json
import sys
import os
import numpy as np
from typing import Dict, List, Any, Optional
import logging

# Import utilities
from ..utils.common import setup_logging, validate_file_path, format_error_message

# Configure logging
logger = setup_logging()


class BoundaryReader:
    """
    Unified reader for HEC-RAS boundary conditions from HDF5 files
    Combines basic and enhanced boundary condition extraction capabilities
    """

    def __init__(self, hdf_file_path: str):
        """
        Initialize the boundary conditions reader

        Args:
            hdf_file_path (str): Path to the HDF5 file
        """
        self.hdf_file_path = validate_file_path(hdf_file_path, ['.hdf', '.h5', '.hdf5'])

    def extract_boundary_conditions(self, enhanced_mode: bool = True) -> Dict[str, Any]:
        """
        Extract all boundary conditions from the HDF5 file

        Args:
            enhanced_mode: If True, use enhanced search for specific boundary names

        Returns:
            Dict containing boundary conditions data
        """
        try:
            with h5py.File(self.hdf_file_path, 'r') as hf:
                logger.info(f"Reading boundary conditions from: {self.hdf_file_path}")

                # Search for boundary condition groups
                if enhanced_mode:
                    boundary_data = self._search_specific_boundary_conditions(hf)
                else:
                    boundary_data = self._search_boundary_conditions(hf)

                # Extract time series data
                time_series_data = self._extract_time_series(hf)

                result = {
                    "success": True,
                    "boundary_conditions": boundary_data,
                    "time_series": time_series_data,
                    "total_boundaries": len(boundary_data),
                    "file_path": str(self.hdf_file_path),
                    "enhanced_mode": enhanced_mode
                }

                logger.info(f"Found {len(boundary_data)} boundary conditions")
                return result

        except Exception as e:
            logger.error(f"Error reading boundary conditions: {str(e)}")
            return {
                "success": True,  # Don't block analysis
                "error": format_error_message(e, "Boundary conditions extraction"),
                "boundary_conditions": [{
                    "name": "Error al leer condiciones de contorno",
                    "type": "Error",
                    "description": f"No se pudieron leer las condiciones de contorno: {str(e)}",
                    "data_available": False,
                    "time_steps": 0,
                    "data_keys": []
                }],
                "time_series": {},
                "total_boundaries": 1,
                "enhanced_mode": enhanced_mode
            }

    def _search_boundary_conditions(self, hf: h5py.File) -> List[Dict[str, Any]]:
        """
        Basic search for boundary condition groups in the HDF5 file

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
                        bc_info = self._create_bc_info(bc_name, f"{bc_path}/{bc_name}", bc_item)
                        if bc_info:
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

    def _search_specific_boundary_conditions(self, hf: h5py.File) -> List[Dict[str, Any]]:
        """
        Enhanced search for specific boundary conditions with actual names

        Args:
            hf: Open HDF5 file handle

        Returns:
            List of boundary condition dictionaries
        """
        boundary_conditions = []

        # Priority search paths for specific boundary condition names
        priority_paths = [
            "Event Conditions/Unsteady/Boundary Conditions/Flow Hydrographs",
            "Event Conditions/Unsteady/Boundary Conditions/Stage Hydrographs",
            "Geometry/Boundary Condition Lines",
            "Event Conditions/Unsteady/Boundary Conditions",
        ]

        # Search in priority paths first
        found_in_specific_paths = False

        for bc_path in priority_paths:
            if bc_path in hf:
                logger.info(f"Found boundary conditions at: {bc_path}")
                bc_group = hf[bc_path]
                path_found_bcs = False

                for bc_name in bc_group.keys():
                    try:
                        bc_item = bc_group[bc_name]

                        # Skip if this looks like a generic group name
                        if bc_name.lower() in ['boundary conditions', 'flow hydrographs', 'stage hydrographs']:
                            # This is a group, search inside it
                            if hasattr(bc_item, 'keys'):
                                for sub_bc_name in bc_item.keys():
                                    try:
                                        sub_bc_item = bc_item[sub_bc_name]
                                        bc_info = self._create_bc_info(sub_bc_name, f"{bc_path}/{bc_name}/{sub_bc_name}", sub_bc_item)
                                        if bc_info:
                                            boundary_conditions.append(bc_info)
                                            logger.info(f"Added specific boundary condition: {sub_bc_name}")
                                            path_found_bcs = True
                                    except Exception as e:
                                        logger.warning(f"Error processing sub-BC {sub_bc_name}: {str(e)}")
                                        continue
                        else:
                            # This looks like a specific boundary condition name
                            bc_info = self._create_bc_info(bc_name, f"{bc_path}/{bc_name}", bc_item)
                            if bc_info:
                                boundary_conditions.append(bc_info)
                                logger.info(f"Added boundary condition: {bc_name}")
                                path_found_bcs = True

                    except Exception as e:
                        logger.warning(f"Error processing boundary condition {bc_name}: {str(e)}")
                        continue

                if path_found_bcs:
                    found_in_specific_paths = True

        # If no specific BCs found, do a recursive search
        if len(boundary_conditions) == 0:
            logger.info("No specific boundary conditions found, doing recursive search...")
            boundary_conditions = self._recursive_search_for_bcs(hf)

        # Remove duplicates based on name and type
        boundary_conditions = self._remove_duplicates(boundary_conditions)

        # If still no BCs found, create a default entry
        if len(boundary_conditions) == 0:
            logger.info("No boundary conditions found anywhere")
            boundary_conditions.append({
                "name": "Sin condiciones de contorno específicas",
                "path": "N/A",
                "type": "Información",
                "description": "No se encontraron condiciones de contorno específicas en el archivo HDF5",
                "data_available": False,
                "time_steps": 0,
                "data_keys": []
            })

        logger.info(f"Final boundary conditions count after deduplication: {len(boundary_conditions)}")
        return boundary_conditions

    def _create_bc_info(self, bc_name: str, bc_path: str, bc_item) -> Optional[Dict[str, Any]]:
        """
        Create boundary condition info dictionary

        Args:
            bc_name: Name of the boundary condition
            bc_path: Full path to the boundary condition
            bc_item: HDF5 item/group

        Returns:
            Boundary condition info dictionary or None
        """
        try:
            bc_info = {
                "name": str(bc_name),
                "path": bc_path,
                "type": self._determine_bc_type(str(bc_name)),
                "description": self._generate_description(str(bc_name)),
                "data_available": False,
                "time_steps": 0,
                "data_keys": []
            }

            # Check if data is available
            if hasattr(bc_item, 'shape'):
                # This is a dataset
                bc_info["data_available"] = True
                bc_info["time_steps"] = bc_item.shape[0] if len(bc_item.shape) > 0 else 0
            elif hasattr(bc_item, 'keys'):
                # This is a group, check for datasets inside
                data_keys = list(bc_item.keys())
                bc_info["data_keys"] = data_keys
                bc_info["data_available"] = len(data_keys) > 0

            return bc_info

        except Exception as e:
            logger.warning(f"Error creating BC info for {bc_name}: {str(e)}")
            return None

    def _recursive_search_for_bcs(self, group, path: str = "") -> List[Dict[str, Any]]:
        """
        Recursively search for boundary conditions in HDF5 groups

        Args:
            group: HDF5 group to search
            path: Current path in the HDF5 structure

        Returns:
            List of boundary condition dictionaries
        """
        boundary_conditions = []

        for key in group.keys():
            item = group[key]
            current_path = f"{path}/{key}" if path else key

            # Check if this looks like a boundary condition
            if self._looks_like_boundary_condition(key, current_path):
                bc_info = self._create_bc_info(key, current_path, item)
                if bc_info:
                    boundary_conditions.append(bc_info)
                    logger.info(f"Found BC in recursive search: {key}")

            # Recurse into groups
            if hasattr(item, 'keys'):
                sub_bcs = self._recursive_search_for_bcs(item, current_path)
                boundary_conditions.extend(sub_bcs)

        return boundary_conditions

    def _looks_like_boundary_condition(self, name: str, path: str) -> bool:
        """
        Check if a name/path looks like a boundary condition

        Args:
            name: Item name
            path: Full path

        Returns:
            True if it looks like a boundary condition
        """
        name_lower = name.lower()
        path_lower = path.lower()

        # Positive indicators
        bc_indicators = [
            'entrada', 'salida', 'inflow', 'outflow', 'inlet', 'outlet',
            'rio', 'river', 'boundary', 'condition', 'hydrograph',
            'stage', 'flow', 'discharge', 'caudal', 'nivel'
        ]

        # Negative indicators (things to avoid)
        avoid_indicators = [
            'geometry', 'mesh', 'terrain', 'material', 'manning',
            'results', 'output', 'time', 'coordinates'
        ]

        # Check for positive indicators
        has_positive = any(indicator in name_lower or indicator in path_lower
                          for indicator in bc_indicators)

        # Check for negative indicators
        has_negative = any(indicator in name_lower or indicator in path_lower
                          for indicator in avoid_indicators)

        return has_positive and not has_negative

    def _remove_duplicates(self, boundary_conditions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate boundary conditions based on name and type

        Args:
            boundary_conditions: List of boundary condition dictionaries

        Returns:
            List with duplicates removed
        """
        seen = set()
        unique_bcs = []

        for bc in boundary_conditions:
            # Create a unique key based on name and type
            key = (bc.get("name", ""), bc.get("type", ""))

            if key not in seen:
                seen.add(key)
                unique_bcs.append(bc)

        return unique_bcs

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
            return "Caudal de Entrada"
        elif any(keyword in name_lower for keyword in ['salida', 'outflow', 'outlet', 'stage']):
            return "Nivel de Salida"
        elif any(keyword in name_lower for keyword in ['flow', 'discharge', 'caudal']):
            return "Hidrograma de Caudal"
        elif any(keyword in name_lower for keyword in ['stage', 'level', 'nivel']):
            return "Hidrograma de Nivel"
        else:
            return "Condición de Contorno"

    def _generate_description(self, bc_name: str) -> str:
        """
        Generate a description for the boundary condition

        Args:
            bc_name: Name of the boundary condition

        Returns:
            Description string
        """
        bc_type = self._determine_bc_type(bc_name)

        if "Entrada" in bc_type:
            return f"Condición de contorno de entrada: {bc_name}"
        elif "Salida" in bc_type:
            return f"Condición de contorno de salida: {bc_name}"
        elif "Caudal" in bc_type:
            return f"Hidrograma de caudal: {bc_name}"
        elif "Nivel" in bc_type:
            return f"Hidrograma de nivel: {bc_name}"
        else:
            return f"Condición de contorno: {bc_name}"

    def _extract_time_series(self, hf: h5py.File) -> Dict[str, Any]:
        """
        Extract time series data from various locations

        Args:
            hf: Open HDF5 file handle

        Returns:
            Dictionary with time series data
        """
        time_series = {}

        # Common time series paths
        ts_paths = [
            "Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series",
            "Results/Unsteady/Output/Output Blocks/DSS Hydrograph Output/Unsteady Time Series",
            "Event Conditions/Unsteady/Boundary Conditions/Flow Hydrographs",
        ]

        for ts_path in ts_paths:
            if ts_path in hf:
                try:
                    self._extract_time_series_from_group(hf[ts_path], time_series, ts_path)
                except Exception as e:
                    logger.warning(f"Error extracting time series from {ts_path}: {str(e)}")
                    continue

        return time_series

    def _extract_time_series_from_group(self, group, time_series: Dict, base_path: str):
        """
        Extract time series data from a specific group

        Args:
            group: HDF5 group containing time series
            time_series: Dictionary to store results
            base_path: Base path for the group
        """
        for key in group.keys():
            try:
                item = group[key]
                if hasattr(item, 'shape') and len(item.shape) > 0:
                    # This is a dataset with data
                    time_series[f"{base_path}/{key}"] = {
                        "shape": item.shape,
                        "dtype": str(item.dtype),
                        "size": item.size
                    }
                elif hasattr(item, 'keys'):
                    # Recurse into subgroups
                    self._extract_time_series_from_group(item, time_series, f"{base_path}/{key}")
            except Exception as e:
                logger.warning(f"Error processing time series item {key}: {str(e)}")
                continue


def main():
    """
    Main function for command line usage
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python boundary_reader.py <hdf_file_path> [--enhanced]"
        }))
        sys.exit(1)

    hdf_file_path = sys.argv[1]
    enhanced_mode = "--enhanced" in sys.argv

    try:
        reader = BoundaryReader(hdf_file_path)
        result = reader.extract_boundary_conditions(enhanced_mode=enhanced_mode)
        print(json.dumps(result, indent=2))

    except Exception as e:
        error_result = {
            "success": False,
            "error": format_error_message(e, "Boundary conditions extraction")
        }
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
