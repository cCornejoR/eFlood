#!/usr/bin/env python3
"""
🌿 Manning Values Extractor for HEC-RAS HDF5 Files
Extracts Manning's n values directly from HDF5 files without requiring terrain files
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

class ManningReader:
    """
    🔍 Extractor for Manning's n values from HEC-RAS HDF5 files
    """

    def __init__(self, hdf_file_path: str):
        """
        Initialize the Manning extractor

        Args:
            hdf_file_path (str): Path to the HDF5 file
        """
        self.hdf_file_path = hdf_file_path

    def extract_manning_values(self) -> Dict[str, Any]:
        """
        Extract Manning's n values from the HDF5 file

        Returns:
            Dict containing Manning values data
        """
        try:
            with h5py.File(self.hdf_file_path, 'r') as hf:
                logger.info(f"Reading Manning values from: {self.hdf_file_path}")

                # First, try to find Manning data in the main HDF file
                manning_data = self._search_manning_data(hf)

                if manning_data is not None and len(manning_data) > 0:
                    # Process and format the data
                    processed_data = self._process_manning_data(manning_data)

                    if processed_data.get('success', False):
                        result = {
                            "success": True,
                            "manning_data": processed_data,
                            "table_printed": True
                        }

                        logger.info(f"Found {processed_data.get('total_zones', 0)} Manning zones in main HDF")
                        return result

                # If not found in main file, try to find LandCover.hdf file
                logger.info("Manning data not found in main HDF, searching for LandCover.hdf...")
                landcover_data = self._search_landcover_file(hf)

                if landcover_data is not None:
                    processed_data = self._process_manning_data(landcover_data)

                    if processed_data.get('success', False):
                        result = {
                            "success": True,
                            "manning_data": processed_data,
                            "table_printed": True,
                            "source": "LandCover.hdf"
                        }

                        logger.info(f"Found {processed_data.get('total_zones', 0)} Manning zones in LandCover.hdf")
                        return result

                return {
                    "success": False,
                    "error": "No Manning data found in HDF5 file or associated LandCover.hdf"
                }

        except Exception as e:
            logger.error(f"Error reading Manning values: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def _search_manning_data(self, hf: h5py.File) -> Optional[np.ndarray]:
        """
        Search for Manning data in the HDF5 file

        Args:
            hf: Open HDF5 file handle

        Returns:
            Manning data array or None
        """
        # Common paths where Manning data is stored
        manning_paths = [
            # Standard HEC-RAS 2D paths
            "Geometry/2D Flow Areas/2D Area 1/Cells Center Manning's n",
            "Geometry/2D Flow Areas/2D Area 1/Manning's n",
            "Geometry/Land Cover (Manning's n)/Manning's n Values",
            "Geometry/Manning's n",
            "Geometry/2D Flow Areas/Manning's n",

            # Results paths
            "Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/2D Area 1/Manning's n",
            "Results/Unsteady/Output/Output Blocks/Base Output/Summary Output/2D Flow Areas/2D Area 1/Manning's n",

            # Alternative naming conventions
            "Geometry/2D Flow Areas/2D Area 1/Cell Manning's n",
            "Geometry/2D Flow Areas/2D Area 1/Cell Center Manning's n",
            "Geometry/2D Flow Areas/2D Area 1/Cells Manning's n",

            # Land cover paths
            "Geometry/Land Cover/Manning's n Values",
            "Geometry/Land Cover/Manning n",
            "Geometry/Land Cover/Manning",
        ]

        for path in manning_paths:
            if path in hf:
                logger.info(f"Found Manning data at: {path}")
                try:
                    data = hf[path][:]
                    if hasattr(data, '__len__') and len(data) > 0:
                        # Validate that this looks like Manning data (values between 0 and 1)
                        if isinstance(data, np.ndarray) and data.size > 0:
                            valid_values = data[(data > 0) & (data < 1.0) & np.isfinite(data)]
                            if len(valid_values) > 0:
                                logger.info(f"Valid Manning data found with {len(valid_values)} values")
                                return data
                except Exception as e:
                    logger.warning(f"Error reading Manning data at {path}: {str(e)}")
                    continue

        # If not found in standard locations, search recursively
        logger.info("Manning data not found in standard paths, searching recursively...")
        logger.info(f"Available top-level groups: {list(hf.keys())}")
        return self._recursive_search_manning(hf)

    def _recursive_search_manning(self, group, path="") -> Optional[np.ndarray]:
        """
        Recursively search for Manning data

        Args:
            group: HDF5 group to search
            path: Current path in the hierarchy

        Returns:
            Manning data array or None
        """
        for key in group.keys():
            item = group[key]
            current_path = f"{path}/{key}" if path else key

            # Check if this looks like Manning data
            if ("manning" in key.lower() or "roughness" in key.lower() or
                "land cover" in key.lower() or key.lower().endswith(" n")):
                if hasattr(item, 'shape') and len(item.shape) >= 1:
                    try:
                        data = item[:]
                        if isinstance(data, np.ndarray) and data.size > 0:
                            # Check if values are in typical Manning range
                            valid_values = data[(data > 0) & (data < 1.0) & np.isfinite(data)]
                            if len(valid_values) > 0:
                                logger.info(f"Found Manning data at: {current_path} ({len(valid_values)} valid values)")
                                return data
                    except Exception as e:
                        logger.debug(f"Error reading data at {current_path}: {str(e)}")
                        continue

            # Recurse into groups
            if hasattr(item, 'keys'):
                result = self._recursive_search_manning(item, current_path)
                if result is not None:
                    return result

        return None

    def _search_landcover_file(self, hf: h5py.File) -> Optional[np.ndarray]:
        """
        Search for LandCover.hdf file in the same directory as the main HDF file

        Args:
            hf: Open HDF5 file handle (main file)

        Returns:
            Manning data array from LandCover.hdf or None
        """
        try:
            # Get the directory of the main HDF file
            hdf_dir = os.path.dirname(self.hdf_file_path)

            # Check for land cover information in the main file attributes
            landcover_filename = None
            landcover_layername = None

            if 'Geometry' in hf and hasattr(hf['Geometry'], 'attrs'):
                attrs = hf['Geometry'].attrs
                if 'Land Cover Filename' in attrs:
                    landcover_filename = attrs['Land Cover Filename']
                    if isinstance(landcover_filename, bytes):
                        landcover_filename = landcover_filename.decode('utf-8')
                    logger.info(f"Found Land Cover Filename: {landcover_filename}")

                if 'Land Cover Layername' in attrs:
                    landcover_layername = attrs['Land Cover Layername']
                    if isinstance(landcover_layername, bytes):
                        landcover_layername = landcover_layername.decode('utf-8')
                    logger.info(f"Found Land Cover Layername: {landcover_layername}")

            # Try different possible LandCover file names
            possible_files = []

            if landcover_layername:
                possible_files.extend([
                    os.path.join(hdf_dir, f"{landcover_layername}.hdf"),
                    os.path.join(hdf_dir, f"{landcover_layername}.hdf5"),
                ])

            if landcover_filename:
                possible_files.extend([
                    os.path.join(hdf_dir, landcover_filename),
                    os.path.join(hdf_dir, landcover_filename.replace('.tif', '.hdf')),
                ])

            # Common LandCover file names
            possible_files.extend([
                os.path.join(hdf_dir, "LandCover.hdf"),
                os.path.join(hdf_dir, "LandCover.hdf5"),
                os.path.join(hdf_dir, "landcover.hdf"),
                os.path.join(hdf_dir, "Manning.hdf"),
                os.path.join(hdf_dir, "manning.hdf"),
            ])

            # Try each possible file
            for landcover_path in possible_files:
                if os.path.exists(landcover_path):
                    logger.info(f"Found potential LandCover file: {landcover_path}")
                    try:
                        with h5py.File(landcover_path, 'r') as lc_hf:
                            manning_data = self._extract_from_landcover_file(lc_hf)
                            if manning_data is not None:
                                logger.info(f"Successfully extracted Manning data from: {landcover_path}")
                                return manning_data
                    except Exception as e:
                        logger.warning(f"Error reading LandCover file {landcover_path}: {str(e)}")
                        continue

            logger.info("No valid LandCover.hdf file found")
            return None

        except Exception as e:
            logger.error(f"Error searching for LandCover file: {str(e)}")
            return None

    def _extract_from_landcover_file(self, lc_hf: h5py.File) -> Optional[np.ndarray]:
        """
        Extract Manning values from a LandCover.hdf file

        Args:
            lc_hf: Open LandCover HDF5 file handle

        Returns:
            Manning data array or None
        """
        try:
            logger.info(f"LandCover file structure: {list(lc_hf.keys())}")

            # Try different structures for different HEC-RAS versions
            manning_paths = [
                "ManningsN",
                "Manning's N",
                "Manning_N",
                "Variables/Manning's N",
                "Variables/ManningsN",
                "Raster Map/Manning's N",
            ]

            for path in manning_paths:
                if path in lc_hf:
                    logger.info(f"Found Manning data at: {path}")
                    try:
                        data = lc_hf[path][:]
                        if isinstance(data, np.ndarray) and data.size > 0:
                            valid_values = data[(data > 0) & (data < 1.0) & np.isfinite(data)]
                            if len(valid_values) > 0:
                                logger.info(f"Valid Manning data found with {len(valid_values)} values")
                                return data
                    except Exception as e:
                        logger.warning(f"Error reading Manning data at {path}: {str(e)}")
                        continue

            # If direct paths don't work, try to extract from IDs and ManningsN arrays
            if 'IDs' in lc_hf and 'ManningsN' in lc_hf:
                try:
                    ids = lc_hf['IDs'][:]
                    manning_values = lc_hf['ManningsN'][:]

                    if len(manning_values) > 0:
                        logger.info(f"Found Manning values via IDs/ManningsN arrays: {len(manning_values)} values")
                        return manning_values

                except Exception as e:
                    logger.warning(f"Error reading IDs/ManningsN arrays: {str(e)}")

            return None

        except Exception as e:
            logger.error(f"Error extracting from LandCover file: {str(e)}")
            return None

    def _process_manning_data(self, manning_array: np.ndarray) -> Dict[str, Any]:
        """
        Process raw Manning data into structured format

        Args:
            manning_array: Raw Manning values array

        Returns:
            Processed Manning data dictionary
        """
        # Clean the data - be more flexible with Manning ranges
        clean_data = []
        for val in manning_array:
            # Accept a wider range of Manning values (some models use values > 1.0)
            if np.isfinite(val) and val > 0 and val < 10.0:  # Expanded valid Manning range
                clean_data.append(float(val))

        # If no values in the typical range, try even more flexible criteria
        if not clean_data:
            for val in manning_array:
                if np.isfinite(val) and val > 0:  # Any positive finite value
                    clean_data.append(float(val))

        if not clean_data:
            logger.warning(f"No valid Manning values found. Raw data sample: {manning_array[:10] if len(manning_array) > 0 else 'empty'}")
            return {
                "success": False,
                "error": f"No valid Manning values found in array of size {len(manning_array)}",
                "total_zones": 0,
                "manning_zones": {},
                "table_data": [],
                "formatted_table": ""
            }

        # Get unique values and create zones
        unique_values = sorted(list(set(clean_data)))
        manning_zones = {}
        table_data = []

        for i, value in enumerate(unique_values):
            zone_id = i + 1
            zone_name = self._get_manning_description(value)

            manning_zones[str(zone_id)] = {
                "name": zone_name,
                "value": value,
                "description": self._get_detailed_description(value)
            }

            table_data.append([
                zone_id,
                zone_name,
                f"{value:.4f}",
                self._get_detailed_description(value)
            ])

        # Create formatted table (simple text format)
        formatted_table = self._create_formatted_table(table_data)

        return {
            "success": True,
            "manning_zones": manning_zones,
            "total_zones": len(unique_values),
            "table_data": table_data,
            "formatted_table": formatted_table
        }

    def _get_manning_description(self, value: float) -> str:
        """Get short description for Manning value"""
        if value < 0.020:
            return "Superficie muy lisa"
        elif value < 0.030:
            return "Superficie lisa"
        elif value < 0.040:
            return "Superficie moderada"
        elif value < 0.050:
            return "Superficie rugosa"
        elif value < 0.070:
            return "Superficie muy rugosa"
        elif value < 0.100:
            return "Superficie extrema"
        else:
            return "Alta resistencia"

    def _get_detailed_description(self, value: float) -> str:
        """Get detailed description for Manning value"""
        if value < 0.020:
            return "Superficie muy lisa (concreto, asfalto)"
        elif value < 0.030:
            return "Superficie lisa (canales revestidos)"
        elif value < 0.040:
            return "Superficie moderada (suelo natural)"
        elif value < 0.050:
            return "Superficie rugosa (cultivos, pastos)"
        elif value < 0.070:
            return "Superficie muy rugosa (vegetación densa)"
        elif value < 0.100:
            return "Superficie extremadamente rugosa (bosques)"
        else:
            return "Superficie con alta resistencia (urbano denso)"

    def _create_formatted_table(self, table_data: List[List]) -> str:
        """Create a simple formatted table"""
        if not table_data:
            return "No hay datos de Manning disponibles"

        lines = []
        lines.append("ID | Tipo de Cobertura | Manning n | Descripción")
        lines.append("-" * 60)

        for row in table_data:
            lines.append(f"{row[0]:2d} | {row[1]:15s} | {row[2]:8s} | {row[3]}")

        return "\n".join(lines)

def main():
    """
    Main function for command line usage
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python manning_extractor.py <hdf_file_path>"
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
        extractor = ManningExtractor(hdf_file_path)
        result = extractor.extract_manning_values()
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
