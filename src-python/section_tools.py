"""
Section Tools Module
Handles cross-section extraction, terrain interpolation, and profile visualization
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from scipy.interpolate import griddata, interp1d

matplotlib.use("Agg")  # Use non-interactive backend


class SectionTools:
    """Class for handling cross-section operations and terrain analysis"""

    def __init__(self):
        """Initialize section tools"""
        self.terrain_data = None
        self.mesh_points = None
        self.mesh_values = None

    def load_terrain_data(self, points: np.ndarray, elevations: np.ndarray) -> None:
        """
        Load terrain data for interpolation

        Args:
            points: Array of (x, y) coordinates
            elevations: Array of elevation values at each point
        """
        self.mesh_points = points
        self.mesh_values = elevations

    def extract_section_profile(
        self,
        start_point: Tuple[float, float],
        end_point: Tuple[float, float],
        num_points: int = 100,
        interpolation_method: str = "linear",
    ) -> Dict[str, Any]:
        """
        Extract elevation profile along a section line

        Args:
            start_point: (x, y) coordinates of section start
            end_point: (x, y) coordinates of section end
            num_points: Number of points along the section
            interpolation_method: Interpolation method ('linear', 'cubic', 'nearest')

        Returns:
            Dictionary with section profile data
        """
        if self.mesh_points is None or self.mesh_values is None:
            raise ValueError("Terrain data must be loaded first")

        # Create points along the section line
        x_start, y_start = start_point
        x_end, y_end = end_point

        x_section = np.linspace(x_start, x_end, num_points)
        y_section = np.linspace(y_start, y_end, num_points)
        section_points = np.column_stack((x_section, y_section))

        # Interpolate elevations at section points
        elevations = griddata(
            self.mesh_points,
            self.mesh_values,
            section_points,
            method=interpolation_method,
            fill_value=np.nan,
        )

        # Calculate distances along section
        distances = np.zeros(num_points)
        for i in range(1, num_points):
            dx = x_section[i] - x_section[i - 1]
            dy = y_section[i] - y_section[i - 1]
            distances[i] = distances[i - 1] + np.sqrt(dx**2 + dy**2)

        return {
            "coordinates": {"x": x_section.tolist(), "y": y_section.tolist()},
            "elevations": elevations.tolist(),
            "distances": distances.tolist(),
            "start_point": start_point,
            "end_point": end_point,
            "total_length": distances[-1],
            "interpolation_method": interpolation_method,
        }

    def generate_multiple_sections(
        self,
        axis_data: Dict[str, Any],
        section_spacing: float,
        section_width: float,
        num_points_per_section: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Generate multiple cross-sections along an axis

        Args:
            axis_data: Axis definition with coordinates and stations
            section_spacing: Distance between sections
            section_width: Width of each section
            num_points_per_section: Number of points per section

        Returns:
            List of section profile dictionaries
        """
        sections = []

        x_coords = axis_data["coordinates"]["x"]
        y_coords = axis_data["coordinates"]["y"]
        stations = axis_data["stations"]
        bearings = axis_data["bearings"]

        # Interpolate axis data
        interp_x = interp1d(stations, x_coords, kind="linear")
        interp_y = interp1d(stations, y_coords, kind="linear")
        interp_bearing = interp1d(stations, bearings, kind="linear")

        current_station = 0.0
        section_id = 1

        while current_station <= stations[-1]:
            # Get point and bearing at current station
            x_center = float(interp_x(current_station))
            y_center = float(interp_y(current_station))
            bearing = float(interp_bearing(current_station))

            # Calculate perpendicular bearing for cross-section
            perp_bearing = bearing + 90.0
            perp_rad = np.radians(perp_bearing)

            # Calculate section endpoints
            half_width = section_width / 2.0
            dx = half_width * np.sin(perp_rad)
            dy = half_width * np.cos(perp_rad)

            start_point = (x_center - dx, y_center - dy)
            end_point = (x_center + dx, y_center + dy)

            # Extract section profile
            try:
                profile = self.extract_section_profile(
                    start_point, end_point, num_points_per_section
                )

                profile.update(
                    {
                        "section_id": section_id,
                        "station": current_station,
                        "center_point": (x_center, y_center),
                        "bearing": perp_bearing,
                        "axis_name": axis_data.get("name", "Unknown"),
                    }
                )

                sections.append(profile)

            except Exception as e:
                print(
                    f"Warning: Failed to extract section at station {current_station}: {e}"
                )

            current_station += section_spacing
            section_id += 1

        return sections

    def plot_section_profile(
        self,
        section_data: Dict[str, Any],
        output_path: str,
        title: Optional[str] = None,
        show_water_level: Optional[float] = None,
    ) -> None:
        """
        Create a plot of the section profile

        Args:
            section_data: Section profile data
            output_path: Path for output image file
            title: Plot title (optional)
            show_water_level: Water level to show on plot (optional)
        """
        distances = section_data["distances"]
        elevations = section_data["elevations"]

        # Filter out NaN values
        valid_mask = ~np.isnan(elevations)
        distances_clean = np.array(distances)[valid_mask]
        elevations_clean = np.array(elevations)[valid_mask]

        if len(distances_clean) == 0:
            raise ValueError("No valid elevation data for plotting")

        plt.figure(figsize=(12, 6))

        # Plot terrain profile
        plt.plot(distances_clean, elevations_clean, "b-", linewidth=2, label="Terrain")
        plt.fill_between(
            distances_clean,
            elevations_clean,
            min(elevations_clean) - 1,
            alpha=0.3,
            color="brown",
        )

        # Plot water level if provided
        if show_water_level is not None:
            plt.axhline(
                y=show_water_level,
                color="cyan",
                linestyle="--",
                linewidth=2,
                label=f"Water Level: {show_water_level:.2f}m",
            )

        plt.xlabel("Distance (m)")
        plt.ylabel("Elevation (m)")
        plt.title(
            title
            or f"Cross-Section Profile (Station: {section_data.get('station', 'N/A')})"
        )
        plt.grid(True, alpha=0.3)
        plt.legend()

        # Add section info as text
        info_text = f"Length: {section_data['total_length']:.1f}m\n"
        info_text += f"Min Elev: {min(elevations_clean):.2f}m\n"
        info_text += f"Max Elev: {max(elevations_clean):.2f}m"

        plt.text(
            0.02,
            0.98,
            info_text,
            transform=plt.gca().transAxes,
            verticalalignment="top",
            bbox=dict(boxstyle="round", facecolor="white", alpha=0.8),
        )

        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches="tight")
        plt.close()

    def calculate_hydraulic_properties(
        self, section_data: Dict[str, Any], water_level: float
    ) -> Dict[str, float]:
        """
        Calculate hydraulic properties for a section at given water level

        Args:
            section_data: Section profile data
            water_level: Water surface elevation

        Returns:
            Dictionary with hydraulic properties
        """
        distances = np.array(section_data["distances"])
        elevations = np.array(section_data["elevations"])

        # Filter out NaN values
        valid_mask = ~np.isnan(elevations)
        distances_clean = distances[valid_mask]
        elevations_clean = elevations[valid_mask]

        if len(distances_clean) == 0:
            return {"error": "No valid elevation data"}

        # Find wetted area
        wetted_mask = elevations_clean <= water_level

        if not np.any(wetted_mask):
            return {
                "wetted_area": 0.0,
                "wetted_perimeter": 0.0,
                "hydraulic_radius": 0.0,
                "top_width": 0.0,
                "max_depth": 0.0,
            }

        # Calculate wetted area using trapezoidal rule
        wetted_distances = distances_clean[wetted_mask]
        wetted_elevations = elevations_clean[wetted_mask]
        depths = water_level - wetted_elevations

        # Simple trapezoidal integration for area
        if len(wetted_distances) > 1:
            dx = np.diff(wetted_distances)
            avg_depths = (depths[:-1] + depths[1:]) / 2
            wetted_area = np.sum(dx * avg_depths)
        else:
            wetted_area = 0.0

        # Calculate wetted perimeter
        wetted_perimeter = 0.0
        for i in range(1, len(wetted_distances)):
            dx = wetted_distances[i] - wetted_distances[i - 1]
            dy = wetted_elevations[i] - wetted_elevations[i - 1]
            wetted_perimeter += np.sqrt(dx**2 + dy**2)

        # Calculate other properties
        hydraulic_radius = (
            wetted_area / wetted_perimeter if wetted_perimeter > 0 else 0.0
        )
        top_width = (
            wetted_distances[-1] - wetted_distances[0]
            if len(wetted_distances) > 1
            else 0.0
        )
        max_depth = np.max(depths) if len(depths) > 0 else 0.0

        return {
            "wetted_area": float(wetted_area),
            "wetted_perimeter": float(wetted_perimeter),
            "hydraulic_radius": float(hydraulic_radius),
            "top_width": float(top_width),
            "max_depth": float(max_depth),
            "water_level": float(water_level),
        }

    def export_sections_to_csv(
        self, sections: List[Dict[str, Any]], output_path: str
    ) -> None:
        """
        Export section data to CSV format

        Args:
            sections: List of section dictionaries
            output_path: Path for output CSV file
        """
        import csv

        with open(output_path, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)

            # Write header
            writer.writerow(
                [
                    "Section_ID",
                    "Station",
                    "Center_X",
                    "Center_Y",
                    "Total_Length",
                    "Min_Elevation",
                    "Max_Elevation",
                    "Bearing",
                    "Axis_Name",
                ]
            )

            # Write data
            for section in sections:
                elevations = [e for e in section["elevations"] if not np.isnan(e)]

                writer.writerow(
                    [
                        section.get("section_id", ""),
                        section.get("station", ""),
                        section.get("center_point", [0, 0])[0],
                        section.get("center_point", [0, 0])[1],
                        section.get("total_length", ""),
                        min(elevations) if elevations else "",
                        max(elevations) if elevations else "",
                        section.get("bearing", ""),
                        section.get("axis_name", ""),
                    ]
                )


def main():
    """Command line interface for section tools"""
    if len(sys.argv) < 2:
        print("Usage: python section_tools.py <command> [args...]")
        print("Commands:")
        print("  profile <start_x> <start_y> <end_x> <end_y> - Extract single profile")
        print("  sections <axis.json> <spacing> <width> - Generate multiple sections")
        print("  plot <section.json> <output.png> - Plot section profile")
        sys.exit(1)

    command = sys.argv[1]

    try:
        tools = SectionTools()

        if command == "profile" and len(sys.argv) >= 6:
            start_x, start_y = float(sys.argv[2]), float(sys.argv[3])
            end_x, end_y = float(sys.argv[4]), float(sys.argv[5])

            # This would need terrain data loaded first
            print("Error: Terrain data must be loaded first")
            sys.exit(1)

        elif command == "sections" and len(sys.argv) >= 5:
            axis_file = sys.argv[2]
            spacing = float(sys.argv[3])
            width = float(sys.argv[4])

            with open(axis_file, "r") as f:
                axis_data = json.load(f)

            # This would need terrain data loaded first
            print("Error: Terrain data must be loaded first")
            sys.exit(1)

        elif command == "plot" and len(sys.argv) >= 4:
            section_file = sys.argv[2]
            output_file = sys.argv[3]

            with open(section_file, "r") as f:
                section_data = json.load(f)

            tools.plot_section_profile(section_data, output_file)
            print(f"Plot saved to: {output_file}")

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
