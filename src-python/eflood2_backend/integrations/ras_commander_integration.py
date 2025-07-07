#!/usr/bin/env python3
"""
🚀 RAS Commander Integration for eFlood2
Advanced HEC-RAS data processing combining RAS Commander with pyHMT2D capabilities
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import geopandas as gpd
import numpy as np
import pandas as pd

# RAS Commander imports
try:
    from ras_commander import (
        HdfBndry,
        HdfMesh,
        HdfResultsMesh,
        HdfResultsPlan,
        RasGeo,
        RasPlan,
        RasUnsteady,
        init_ras_project,
    )

    RAS_COMMANDER_AVAILABLE = True
except ImportError as e:
    RAS_COMMANDER_AVAILABLE = False
    print(f"RAS Commander not available: {e}")

# pyHMT2D integration - disabled temporarily due to numpy compatibility issues
PYHMT2D_AVAILABLE = False
# try:
#     from ..hecras_hdf import RAS_2D
#     PYHMT2D_AVAILABLE = True
# except ImportError:
#     PYHMT2D_AVAILABLE = False

# eFlood2 utilities
from ..utils.common import format_error_message, setup_logging, validate_file_path

# Configure logging
logger = setup_logging()


class RASCommanderProcessor:
    """
    🔥 Advanced HEC-RAS processor combining RAS Commander with pyHMT2D
    Provides comprehensive data extraction, analysis, and export capabilities
    """

    def __init__(self, hdf_file_path: str, terrain_file_path: Optional[str] = None):
        """
        Initialize the RAS Commander processor

        Args:
            hdf_file_path: Path to HEC-RAS HDF file
            terrain_file_path: Optional path to terrain file for pyHMT2D compatibility
        """
        self.hdf_file_path = validate_file_path(hdf_file_path, [".hdf", ".h5", ".hdf5"])
        self.terrain_file_path = terrain_file_path

        # Initialize pyHMT2D if available and terrain file provided
        self.pyhmt2d_data = None
        # Temporarily disabled due to numpy compatibility issues
        # if PYHMT2D_AVAILABLE and terrain_file_path and os.path.exists(terrain_file_path):
        #     try:
        #         self.pyhmt2d_data = RAS_2D.RAS_2D_Data(hdf_file_path, terrain_file_path)
        #         logger.info("pyHMT2D integration initialized successfully")
        #     except Exception as e:
        #         logger.warning(f"pyHMT2D initialization failed: {e}")

    def get_comprehensive_mesh_info(self) -> Dict[str, Any]:
        """
        Extract comprehensive mesh information using RAS Commander

        Returns:
            Dict containing detailed mesh information
        """
        if not RAS_COMMANDER_AVAILABLE:
            return {"success": False, "error": "RAS Commander not available"}

        try:
            result = {
                "success": True,
                "mesh_areas": [],
                "mesh_summary": {},
                "breaklines": None,
                "max_results": {},
            }

            # Get mesh area names
            mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)
            result["mesh_areas"] = mesh_names
            logger.info(f"Found {len(mesh_names)} mesh areas: {mesh_names}")

            # Get comprehensive results for each mesh area
            for mesh_name in mesh_names:
                try:
                    # Maximum water surface elevation
                    max_ws = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)
                    if max_ws is not None and not max_ws.empty:
                        result["max_results"][f"{mesh_name}_max_ws"] = {
                            "count": len(max_ws),
                            "min_elevation": (
                                float(max_ws.geometry.bounds.miny.min())
                                if hasattr(max_ws, "geometry")
                                else None
                            ),
                            "max_elevation": (
                                float(max_ws.geometry.bounds.maxy.max())
                                if hasattr(max_ws, "geometry")
                                else None
                            ),
                            "has_geometry": hasattr(max_ws, "geometry"),
                        }

                    # Maximum face velocity
                    max_vel = HdfResultsMesh.get_mesh_max_face_v(self.hdf_file_path)
                    if max_vel is not None and not max_vel.empty:
                        result["max_results"][f"{mesh_name}_max_velocity"] = {
                            "count": len(max_vel),
                            "has_geometry": hasattr(max_vel, "geometry"),
                        }

                    # Maximum water surface error
                    max_ws_err = HdfResultsMesh.get_mesh_max_ws_err(self.hdf_file_path)
                    if max_ws_err is not None and not max_ws_err.empty:
                        result["max_results"][f"{mesh_name}_max_ws_error"] = {
                            "count": len(max_ws_err),
                            "has_geometry": hasattr(max_ws_err, "geometry"),
                        }

                except Exception as e:
                    logger.warning(f"Error processing mesh {mesh_name}: {e}")
                    continue

            # Get breaklines
            try:
                breaklines = HdfBndry.get_breaklines(self.hdf_file_path)
                if breaklines is not None and not breaklines.empty:
                    result["breaklines"] = {
                        "count": len(breaklines),
                        "has_geometry": hasattr(breaklines, "geometry"),
                        "columns": (
                            list(breaklines.columns)
                            if hasattr(breaklines, "columns")
                            else []
                        ),
                    }
            except Exception as e:
                logger.warning(f"Error extracting breaklines: {e}")

            return result

        except Exception as e:
            logger.error(f"Error in comprehensive mesh analysis: {e}")
            return {
                "success": False,
                "error": f"Comprehensive mesh analysis failed: {str(e)}",
            }

    def get_time_series_data(
        self, mesh_name: str, variable: str = "Water Surface"
    ) -> Dict[str, Any]:
        """
        Extract time series data for specific mesh and variable

        Args:
            mesh_name: Name of the mesh area
            variable: Variable to extract (e.g., "Water Surface", "Velocity")

        Returns:
            Dict containing time series data
        """
        if not RAS_COMMANDER_AVAILABLE:
            return {"success": False, "error": "RAS Commander not available"}

        try:
            # Get time series data using RAS Commander
            timeseries_data = HdfResultsMesh.get_mesh_timeseries(
                self.hdf_file_path, mesh_name, variable
            )

            if timeseries_data is not None and not timeseries_data.empty:
                result = {
                    "success": True,
                    "mesh_name": mesh_name,
                    "variable": variable,
                    "data_shape": timeseries_data.shape,
                    "columns": list(timeseries_data.columns),
                    "time_steps": len(timeseries_data),
                    "has_geometry": hasattr(timeseries_data, "geometry"),
                    "sample_data": (
                        timeseries_data.head(5).to_dict()
                        if len(timeseries_data) > 0
                        else {}
                    ),
                }

                # Add statistical summary
                if len(timeseries_data) > 0:
                    numeric_cols = timeseries_data.select_dtypes(
                        include=[np.number]
                    ).columns
                    if len(numeric_cols) > 0:
                        result["statistics"] = (
                            timeseries_data[numeric_cols].describe().to_dict()
                        )

                return result
            else:
                return {
                    "success": False,
                    "error": f"No time series data found for mesh '{mesh_name}' and variable '{variable}'",
                }

        except Exception as e:
            logger.error(f"Error extracting time series data: {e}")
            return {
                "success": False,
                "error": f"Time series extraction failed: {str(e)}",
            }

    def export_to_vtk_enhanced(self, output_directory: str) -> Dict[str, Any]:
        """
        Enhanced VTK export combining RAS Commander data with pyHMT2D export capabilities

        Args:
            output_directory: Directory for VTK output files

        Returns:
            Dict containing export results
        """
        try:
            os.makedirs(output_directory, exist_ok=True)

            result = {
                "success": True,
                "exported_files": [],
                "ras_commander_data": {},
                "pyhmt2d_export": {},
            }

            # Use RAS Commander to get comprehensive data
            if RAS_COMMANDER_AVAILABLE:
                mesh_info = self.get_comprehensive_mesh_info()
                result["ras_commander_data"] = mesh_info

                # Export mesh data to GeoDataFrames for VTK conversion
                mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)
                for mesh_name in mesh_names:
                    try:
                        # Get maximum water surface data
                        max_ws_gdf = HdfResultsMesh.get_mesh_max_ws(self.hdf_file_path)
                        if max_ws_gdf is not None and not max_ws_gdf.empty:
                            # Export to shapefile first, then convert to VTK if needed
                            shapefile_path = os.path.join(
                                output_directory, f"{mesh_name}_max_ws.shp"
                            )
                            max_ws_gdf.to_file(shapefile_path)
                            result["exported_files"].append(shapefile_path)
                            logger.info(
                                f"Exported {mesh_name} max water surface to {shapefile_path}"
                            )

                    except Exception as e:
                        logger.warning(f"Error exporting mesh {mesh_name}: {e}")
                        continue

            # Use pyHMT2D for VTK export if available
            if self.pyhmt2d_data is not None:
                try:
                    # This would call the pyHMT2D VTK export functionality
                    # Implementation depends on the specific pyHMT2D methods available
                    result["pyhmt2d_export"] = {
                        "status": "pyHMT2D VTK export functionality available",
                        "note": "Specific VTK export implementation needed based on pyHMT2D API",
                    }
                except Exception as e:
                    logger.warning(f"pyHMT2D VTK export error: {e}")

            return result

        except Exception as e:
            logger.error(f"Enhanced VTK export failed: {e}")
            return {"success": False, "error": f"Enhanced VTK export failed: {str(e)}"}

    def get_manning_values_enhanced(self) -> Dict[str, Any]:
        """
        Enhanced Manning values extraction using both RAS Commander and existing methods

        Returns:
            Dict containing Manning values data
        """
        try:
            result = {
                "success": True,
                "ras_commander_data": {},
                "pyhmt2d_data": {},
                "combined_analysis": {},
            }

            # Try RAS Commander approach first
            if RAS_COMMANDER_AVAILABLE:
                try:
                    # RAS Commander doesn't have direct Manning extraction in the basic API
                    # But we can use it to get mesh information and then extract Manning data
                    mesh_names = HdfMesh.get_mesh_area_names(self.hdf_file_path)
                    result["ras_commander_data"]["mesh_areas"] = mesh_names
                    result["ras_commander_data"][
                        "note"
                    ] = "RAS Commander mesh info extracted successfully"
                except Exception as e:
                    logger.warning(f"RAS Commander Manning extraction error: {e}")

            # Use existing Manning reader as fallback
            from ..readers.manning_reader import ManningReader

            manning_reader = ManningReader(self.hdf_file_path)
            manning_result = manning_reader.extract_manning_values()
            result["existing_method"] = manning_result

            # Combine results
            if manning_result.get("success", False):
                result["combined_analysis"] = {
                    "total_zones": manning_result.get("manning_data", {}).get(
                        "total_zones", 0
                    ),
                    "extraction_method": "eFlood2 ManningReader",
                    "ras_commander_available": RAS_COMMANDER_AVAILABLE,
                }

            return result

        except Exception as e:
            logger.error(f"Enhanced Manning extraction failed: {e}")
            return {
                "success": False,
                "error": f"Enhanced Manning extraction failed: {str(e)}",
            }


def main():
    """
    Main function for command line usage
    """
    if len(sys.argv) < 3:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Usage: python -m eflood2_backend.integrations.ras_commander_integration <command> <hdf_file_path> [terrain_file_path]",
                }
            )
        )
        sys.exit(1)

    command = sys.argv[1]
    hdf_file_path = sys.argv[2]
    terrain_file_path = sys.argv[3] if len(sys.argv) > 3 else None

    if not os.path.exists(hdf_file_path):
        print(
            json.dumps(
                {"success": False, "error": f"HDF file not found: {hdf_file_path}"}
            )
        )
        sys.exit(1)

    try:
        processor = RASCommanderProcessor(hdf_file_path, terrain_file_path)

        if command == "mesh_info":
            result = processor.get_comprehensive_mesh_info()
        elif command == "manning":
            result = processor.get_manning_values_enhanced()
        elif command == "export_vtk":
            output_dir = sys.argv[4] if len(sys.argv) > 4 else "./vtk_output"
            result = processor.export_to_vtk_enhanced(output_dir)
        elif command == "timeseries":
            mesh_name = sys.argv[4] if len(sys.argv) > 4 else "2D Area 1"
            variable = sys.argv[5] if len(sys.argv) > 5 else "Water Surface"
            result = processor.get_time_series_data(mesh_name, variable)
        else:
            result = {
                "success": False,
                "error": f"Unknown command: {command}. Available: mesh_info, manning, export_vtk, timeseries",
            }

        print(json.dumps(result, indent=2))

    except Exception as e:
        error_result = {"success": False, "error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
