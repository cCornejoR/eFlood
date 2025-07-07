"""
Geometry Tools Module
Handles axis definition, spline generation, and coordinate management
"""

import json
import sys
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pyproj
from scipy.interpolate import interp1d, splev, splprep

# Import utilities
from ..utils.common import format_error_message, setup_logging, validate_file_path

# Configure logging
logger = setup_logging()


class GeometryProcessor:
    """Class for handling geometric operations and axis management"""

    def __init__(self, crs: str = "EPSG:4326"):
        """
        Initialize geometry tools

        Args:
            crs (str): Coordinate reference system
        """
        self.crs = crs
        self.transformer = None

    def set_projection(self, source_crs: str, target_crs: str) -> None:
        """
        Set up coordinate transformation

        Args:
            source_crs: Source coordinate reference system
            target_crs: Target coordinate reference system
        """
        self.transformer = pyproj.Transformer.from_crs(
            source_crs, target_crs, always_xy=True
        )

    def create_spline_from_points(
        self,
        points: List[Tuple[float, float]],
        smoothing: float = 0.0,
        num_points: int = 100,
    ) -> Dict[str, List[float]]:
        """
        Create a smooth spline from input points

        Args:
            points: List of (x, y) coordinate tuples
            smoothing: Smoothing factor (0 = no smoothing)
            num_points: Number of points in output spline

        Returns:
            Dictionary with 'x' and 'y' coordinate lists
        """
        if len(points) < 3:
            raise ValueError("At least 3 points are required for spline creation")

        points_array = np.array(points)
        x = points_array[:, 0]
        y = points_array[:, 1]

        # Create spline
        tck, u = splprep([x, y], s=smoothing)

        # Generate points along spline
        u_new = np.linspace(0, 1, num_points)
        spline_points = splev(u_new, tck)

        return {
            "x": spline_points[0].tolist(),
            "y": spline_points[1].tolist(),
            "original_points": points,
            "parameters": {"smoothing": smoothing, "num_points": num_points},
        }

    def create_axis_from_spline(
        self, spline_data: Dict[str, Any], axis_name: str = "Main Axis"
    ) -> Dict[str, Any]:
        """
        Create an axis definition from spline data

        Args:
            spline_data: Spline data from create_spline_from_points
            axis_name: Name for the axis

        Returns:
            Axis definition dictionary
        """
        x_coords = spline_data["x"]
        y_coords = spline_data["y"]

        # Calculate distances along axis
        distances = [0.0]
        for i in range(1, len(x_coords)):
            dx = x_coords[i] - x_coords[i - 1]
            dy = y_coords[i] - y_coords[i - 1]
            dist = np.sqrt(dx**2 + dy**2)
            distances.append(distances[-1] + dist)

        # Calculate directions (bearings)
        bearings = []
        for i in range(len(x_coords) - 1):
            dx = x_coords[i + 1] - x_coords[i]
            dy = y_coords[i + 1] - y_coords[i]
            bearing = np.degrees(np.arctan2(dx, dy))
            bearings.append(bearing)
        bearings.append(bearings[-1])  # Duplicate last bearing

        return {
            "name": axis_name,
            "coordinates": {"x": x_coords, "y": y_coords},
            "stations": distances,
            "bearings": bearings,
            "total_length": distances[-1],
            "crs": self.crs,
            "spline_params": spline_data.get("parameters", {}),
        }

    def generate_cross_sections(
        self,
        axis: Dict[str, Any],
        section_spacing: float,
        section_width: float,
        start_station: float = 0.0,
        end_station: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate cross-sections perpendicular to an axis

        Args:
            axis: Axis definition dictionary
            section_spacing: Distance between sections
            section_width: Total width of each section
            start_station: Starting station along axis
            end_station: Ending station (None for full axis)

        Returns:
            List of cross-section definitions
        """
        if end_station is None:
            end_station = axis["total_length"]

        sections = []
        x_coords = axis["coordinates"]["x"]
        y_coords = axis["coordinates"]["y"]
        stations = axis["stations"]
        bearings = axis["bearings"]

        # Interpolate axis data
        interp_x = interp1d(stations, x_coords, kind="linear")
        interp_y = interp1d(stations, y_coords, kind="linear")
        interp_bearing = interp1d(stations, bearings, kind="linear")

        current_station = start_station
        section_id = 1

        while current_station <= end_station:
            if current_station > stations[-1]:
                break

            # Get point and bearing at current station
            x_center = float(interp_x(current_station))
            y_center = float(interp_y(current_station))
            bearing = float(interp_bearing(current_station))

            # Calculate perpendicular bearing
            perp_bearing = bearing + 90.0
            perp_rad = np.radians(perp_bearing)

            # Calculate section endpoints
            half_width = section_width / 2.0
            dx = half_width * np.sin(perp_rad)
            dy = half_width * np.cos(perp_rad)

            left_point = (x_center - dx, y_center - dy)
            right_point = (x_center + dx, y_center + dy)

            section = {
                "id": section_id,
                "station": current_station,
                "center_point": (x_center, y_center),
                "left_point": left_point,
                "right_point": right_point,
                "bearing": perp_bearing,
                "width": section_width,
                "axis_name": axis["name"],
            }

            sections.append(section)
            current_station += section_spacing
            section_id += 1

        return sections

    def export_to_geojson(
        self,
        geometries: List[Dict[str, Any]],
        output_path: str,
        geometry_type: str = "LineString",
    ) -> None:
        """
        Export geometries to GeoJSON format

        Args:
            geometries: List of geometry dictionaries
            output_path: Path for output GeoJSON file
            geometry_type: Type of geometry (LineString, Point, etc.)
        """
        features = []

        for geom in geometries:
            if geometry_type == "LineString":
                if "coordinates" in geom:
                    coords = list(
                        zip(geom["coordinates"]["x"], geom["coordinates"]["y"])
                    )
                elif "left_point" in geom and "right_point" in geom:
                    coords = [geom["left_point"], geom["right_point"]]
                else:
                    continue

                feature = {
                    "type": "Feature",
                    "geometry": {"type": "LineString", "coordinates": coords},
                    "properties": {
                        k: v
                        for k, v in geom.items()
                        if k not in ["coordinates", "left_point", "right_point"]
                    },
                }

            elif geometry_type == "Point":
                if "center_point" in geom:
                    coords = geom["center_point"]
                elif "coordinates" in geom:
                    coords = (geom["coordinates"]["x"][0], geom["coordinates"]["y"][0])
                else:
                    continue

                feature = {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": coords},
                    "properties": {
                        k: v
                        for k, v in geom.items()
                        if k not in ["coordinates", "center_point"]
                    },
                }

            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": self.crs}},
            "features": features,
        }

        with open(output_path, "w") as f:
            json.dump(geojson, f, indent=2)

    def calculate_distances_along_line(
        self, coordinates: List[Tuple[float, float]]
    ) -> List[float]:
        """
        Calculate cumulative distances along a line

        Args:
            coordinates: List of (x, y) coordinate tuples

        Returns:
            List of cumulative distances
        """
        distances = [0.0]

        for i in range(1, len(coordinates)):
            dx = coordinates[i][0] - coordinates[i - 1][0]
            dy = coordinates[i][1] - coordinates[i - 1][1]
            dist = np.sqrt(dx**2 + dy**2)
            distances.append(distances[-1] + dist)

        return distances


def main():
    """Command line interface for geometry tools"""
    if len(sys.argv) < 2:
        print("Usage: python geometry_tools.py <command> [args...]")
        print("Commands:")
        print("  spline <points.json> - Create spline from points")
        print("  axis <spline.json> <name> - Create axis from spline")
        print("  sections <axis.json> <spacing> <width> - Generate cross-sections")
        sys.exit(1)

    command = sys.argv[1]

    try:
        tools = GeometryTools()

        if command == "spline" and len(sys.argv) >= 3:
            points_file = sys.argv[2]
            with open(points_file, "r") as f:
                points = json.load(f)

            spline = tools.create_spline_from_points(points)
            print(json.dumps(spline, indent=2))

        elif command == "axis" and len(sys.argv) >= 4:
            spline_file = sys.argv[2]
            axis_name = sys.argv[3]

            with open(spline_file, "r") as f:
                spline_data = json.load(f)

            axis = tools.create_axis_from_spline(spline_data, axis_name)
            print(json.dumps(axis, indent=2))

        elif command == "sections" and len(sys.argv) >= 5:
            axis_file = sys.argv[2]
            spacing = float(sys.argv[3])
            width = float(sys.argv[4])

            with open(axis_file, "r") as f:
                axis = json.load(f)

            sections = tools.generate_cross_sections(axis, spacing, width)
            print(json.dumps(sections, indent=2))

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
