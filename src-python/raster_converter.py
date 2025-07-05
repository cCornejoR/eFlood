"""
Raster Converter Module
Converts hydraulic results to GeoTIFF format for GIS compatibility
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.transform import from_bounds


class RasterConverter:
    """Class for converting hydraulic data to raster formats"""

    def __init__(self, crs: str = "EPSG:4326"):
        """
        Initialize raster converter

        Args:
            crs (str): Coordinate reference system (default: WGS84)
        """
        self.crs = CRS.from_string(crs)

    def array_to_geotiff(
        self,
        data: np.ndarray,
        bounds: Tuple[float, float, float, float],
        output_path: str,
        nodata_value: float = -9999.0,
        description: str = "",
    ) -> None:
        """
        Convert numpy array to GeoTIFF

        Args:
            data: 2D numpy array with the data
            bounds: (min_x, min_y, max_x, max_y) in the CRS units
            output_path: Path for output GeoTIFF file
            nodata_value: Value to use for no-data pixels
            description: Description for the raster
        """
        height, width = data.shape

        # Create transform from bounds
        transform = from_bounds(*bounds, width, height)

        # Handle NaN values
        data_copy = data.copy()
        data_copy[np.isnan(data_copy)] = nodata_value

        # Write GeoTIFF
        with rasterio.open(
            output_path,
            "w",
            driver="GTiff",
            height=height,
            width=width,
            count=1,
            dtype=data_copy.dtype,
            crs=self.crs,
            transform=transform,
            nodata=nodata_value,
            compress="lzw",
        ) as dst:
            dst.write(data_copy, 1)
            dst.set_band_description(1, description)

    def hdf_results_to_rasters(
        self,
        hdf_data: Dict[str, np.ndarray],
        coordinates: Dict[str, np.ndarray],
        output_dir: str,
        prefix: str = "hecras",
    ) -> List[str]:
        """
        Convert multiple HDF datasets to raster files

        Args:
            hdf_data: Dictionary with dataset names and numpy arrays
            coordinates: Dictionary with 'x' and 'y' coordinate arrays
            output_dir: Directory for output files
            prefix: Prefix for output filenames

        Returns:
            List of created file paths
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        created_files = []

        # Get bounds from coordinates
        x_coords = coordinates.get("x", np.array([]))
        y_coords = coordinates.get("y", np.array([]))

        if len(x_coords) == 0 or len(y_coords) == 0:
            raise ValueError("Coordinate arrays are required")

        bounds = (
            float(np.min(x_coords)),
            float(np.min(y_coords)),
            float(np.max(x_coords)),
            float(np.max(y_coords)),
        )

        for dataset_name, data_array in hdf_data.items():
            # Clean dataset name for filename
            clean_name = dataset_name.replace("/", "_").replace(" ", "_")
            output_path = output_dir / f"{prefix}_{clean_name}.tif"

            try:
                self.array_to_geotiff(
                    data=data_array,
                    bounds=bounds,
                    output_path=str(output_path),
                    description=f"HEC-RAS result: {dataset_name}",
                )
                created_files.append(str(output_path))

            except Exception as e:
                print(f"Warning: Failed to create raster for {dataset_name}: {e}")

        return created_files

    def create_mesh_raster(
        self,
        mesh_points: np.ndarray,
        values: np.ndarray,
        output_path: str,
        resolution: float = 1.0,
        interpolation_method: str = "linear",
    ) -> None:
        """
        Create raster from irregular mesh points

        Args:
            mesh_points: Array of (x, y) coordinates
            values: Values at each mesh point
            output_path: Path for output raster
            resolution: Pixel resolution in CRS units
            interpolation_method: Interpolation method ('linear', 'cubic', 'nearest')
        """
        from scipy.interpolate import griddata

        # Get bounds
        x_min, y_min = np.min(mesh_points, axis=0)
        x_max, y_max = np.max(mesh_points, axis=0)

        # Create regular grid
        x_range = np.arange(x_min, x_max + resolution, resolution)
        y_range = np.arange(y_min, y_max + resolution, resolution)
        xi, yi = np.meshgrid(x_range, y_range)

        # Interpolate values to regular grid
        zi = griddata(
            mesh_points,
            values,
            (xi, yi),
            method=interpolation_method,
            fill_value=np.nan,
        )

        # Flip y-axis for raster (top-left origin)
        zi = np.flipud(zi)

        bounds = (x_min, y_min, x_max, y_max)

        self.array_to_geotiff(
            data=zi,
            bounds=bounds,
            output_path=output_path,
            description="Interpolated mesh data",
        )

    def get_raster_info(self, raster_path: str) -> Dict[str, Any]:
        """
        Get information about a raster file

        Args:
            raster_path: Path to raster file

        Returns:
            Dictionary with raster information
        """
        with rasterio.open(raster_path) as src:
            return {
                "width": src.width,
                "height": src.height,
                "count": src.count,
                "dtype": str(src.dtype),
                "crs": str(src.crs),
                "bounds": src.bounds,
                "transform": list(src.transform),
                "nodata": src.nodata,
                "description": src.descriptions[0] if src.descriptions else "",
            }


def main():
    """Command line interface for raster converter"""
    if len(sys.argv) < 2:
        print("Usage: python raster_converter.py <command> [args...]")
        print("Commands:")
        print("  info <raster_file> - Get raster information")
        print("  convert <input_data.json> <output_dir> - Convert data to rasters")
        sys.exit(1)

    command = sys.argv[1]

    try:
        converter = RasterConverter()

        if command == "info" and len(sys.argv) >= 3:
            raster_path = sys.argv[2]
            info = converter.get_raster_info(raster_path)
            print(json.dumps(info, indent=2, default=str))

        elif command == "convert" and len(sys.argv) >= 4:
            input_file = sys.argv[2]
            output_dir = sys.argv[3]

            with open(input_file, "r") as f:
                data = json.load(f)

            # Expected format: {'data': {...}, 'coordinates': {'x': [...], 'y': [...]}}
            hdf_data = {k: np.array(v) for k, v in data["data"].items()}
            coordinates = {k: np.array(v) for k, v in data["coordinates"].items()}

            created_files = converter.hdf_results_to_rasters(
                hdf_data, coordinates, output_dir
            )

            print(json.dumps({"created_files": created_files}, indent=2))

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
