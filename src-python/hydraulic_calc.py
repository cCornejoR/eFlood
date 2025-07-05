"""
Hydraulic Calculations Module
Implements hydraulic calculation functions for flow analysis
"""

import json
import math
import sys
from typing import Any, Dict, List, Optional, Tuple

import numpy as np


class HydraulicCalculator:
    """Class for hydraulic calculations and flow analysis"""

    def __init__(self):
        """Initialize hydraulic calculator"""
        self.gravity = 9.81  # m/s²

    def calculate_normal_depth(
        self,
        discharge: float,
        slope: float,
        manning_n: float,
        channel_width: float,
        side_slope: float = 0.0,
    ) -> Dict[str, float]:
        """
        Calculate normal depth for uniform flow

        Args:
            discharge: Flow rate (m³/s)
            slope: Channel slope (m/m)
            manning_n: Manning's roughness coefficient
            channel_width: Bottom width (m)
            side_slope: Side slope (horizontal:vertical, e.g., 2:1 = 2.0)

        Returns:
            Dictionary with normal depth and related parameters
        """

        # Iterative solution for normal depth
        def manning_equation(depth):
            area = channel_width * depth + side_slope * depth**2
            wetted_perimeter = channel_width + 2 * depth * math.sqrt(1 + side_slope**2)
            hydraulic_radius = area / wetted_perimeter if wetted_perimeter > 0 else 0

            velocity = (
                (1 / manning_n) * (hydraulic_radius ** (2 / 3)) * math.sqrt(slope)
            )
            calculated_q = area * velocity
            return calculated_q - discharge

        # Use bisection method to find normal depth
        depth_low = 0.01
        depth_high = 10.0
        tolerance = 1e-6
        max_iterations = 100

        for _ in range(max_iterations):
            depth_mid = (depth_low + depth_high) / 2

            if abs(manning_equation(depth_mid)) < tolerance:
                break

            if manning_equation(depth_low) * manning_equation(depth_mid) < 0:
                depth_high = depth_mid
            else:
                depth_low = depth_mid

        normal_depth = depth_mid

        # Calculate related parameters
        area = channel_width * normal_depth + side_slope * normal_depth**2
        wetted_perimeter = channel_width + 2 * normal_depth * math.sqrt(
            1 + side_slope**2
        )
        hydraulic_radius = area / wetted_perimeter
        velocity = discharge / area

        return {
            "normal_depth": float(normal_depth),
            "area": float(area),
            "wetted_perimeter": float(wetted_perimeter),
            "hydraulic_radius": float(hydraulic_radius),
            "velocity": float(velocity),
            "discharge": float(discharge),
        }

    def calculate_critical_depth(
        self, discharge: float, channel_width: float, side_slope: float = 0.0
    ) -> Dict[str, float]:
        """
        Calculate critical depth for given discharge

        Args:
            discharge: Flow rate (m³/s)
            channel_width: Bottom width (m)
            side_slope: Side slope (horizontal:vertical)

        Returns:
            Dictionary with critical depth and related parameters
        """

        def critical_equation(depth):
            area = channel_width * depth + side_slope * depth**2
            top_width = channel_width + 2 * side_slope * depth

            if area == 0 or top_width == 0:
                return float("inf")

            return (discharge**2 * top_width) / (self.gravity * area**3) - 1

        # Use bisection method
        depth_low = 0.01
        depth_high = 10.0
        tolerance = 1e-6
        max_iterations = 100

        for _ in range(max_iterations):
            depth_mid = (depth_low + depth_high) / 2

            if abs(critical_equation(depth_mid)) < tolerance:
                break

            if critical_equation(depth_low) * critical_equation(depth_mid) < 0:
                depth_high = depth_mid
            else:
                depth_low = depth_mid

        critical_depth = depth_mid

        # Calculate related parameters
        area = channel_width * critical_depth + side_slope * critical_depth**2
        velocity = discharge / area
        froude_number = velocity / math.sqrt(self.gravity * critical_depth)

        return {
            "critical_depth": float(critical_depth),
            "area": float(area),
            "velocity": float(velocity),
            "froude_number": float(froude_number),
            "discharge": float(discharge),
        }

    def calculate_froude_number(self, velocity: float, depth: float) -> float:
        """
        Calculate Froude number

        Args:
            velocity: Flow velocity (m/s)
            depth: Flow depth (m)

        Returns:
            Froude number
        """
        return velocity / math.sqrt(self.gravity * depth)

    def calculate_energy_head(
        self, velocity: float, depth: float, elevation: float = 0.0
    ) -> Dict[str, float]:
        """
        Calculate energy components

        Args:
            velocity: Flow velocity (m/s)
            depth: Flow depth (m)
            elevation: Bottom elevation (m)

        Returns:
            Dictionary with energy components
        """
        velocity_head = velocity**2 / (2 * self.gravity)
        pressure_head = depth
        total_energy = elevation + depth + velocity_head

        return {
            "velocity_head": float(velocity_head),
            "pressure_head": float(pressure_head),
            "elevation_head": float(elevation),
            "total_energy": float(total_energy),
        }

    def calculate_scour_depth(
        self, velocity: float, depth: float, d50: float, method: str = "lacey"
    ) -> Dict[str, float]:
        """
        Calculate scour depth using various methods

        Args:
            velocity: Flow velocity (m/s)
            depth: Flow depth (m)
            d50: Median grain size (mm)
            method: Scour calculation method

        Returns:
            Dictionary with scour depth and parameters
        """
        if method.lower() == "lacey":
            # Lacey's method for scour depth
            scour_depth = (
                0.473 * (velocity**2 / self.gravity) ** (1 / 3) * depth ** (2 / 3)
            )

        elif method.lower() == "blench":
            # Blench method
            scour_depth = (
                0.5 * depth * (velocity / math.sqrt(self.gravity * depth)) ** 1.5
            )

        else:
            # Simple velocity-based method
            critical_velocity = 0.6 * math.sqrt(d50 / 1000)  # Convert mm to m
            if velocity > critical_velocity:
                scour_depth = 0.3 * depth * (velocity / critical_velocity - 1)
            else:
                scour_depth = 0.0

        return {
            "scour_depth": float(scour_depth),
            "method": method,
            "velocity": float(velocity),
            "depth": float(depth),
            "d50": float(d50),
        }

    def calculate_stable_width(
        self, discharge: float, d50: float, slope: float, method: str = "lacey"
    ) -> Dict[str, float]:
        """
        Calculate stable channel width

        Args:
            discharge: Flow rate (m³/s)
            d50: Median grain size (mm)
            slope: Channel slope (m/m)
            method: Calculation method

        Returns:
            Dictionary with stable width and parameters
        """
        if method.lower() == "lacey":
            # Lacey's regime equations
            silt_factor = 1.76 * math.sqrt(d50)  # d50 in mm
            stable_width = 4.75 * math.sqrt(discharge / silt_factor)

        elif method.lower() == "blench":
            # Blench method
            bed_factor = 1.9 * math.sqrt(d50)  # d50 in mm
            stable_width = 1.81 * (discharge / bed_factor) ** (0.5)

        else:
            # Simple empirical method
            stable_width = 2.3 * discharge ** (0.5)

        return {
            "stable_width": float(stable_width),
            "method": method,
            "discharge": float(discharge),
            "d50": float(d50),
            "slope": float(slope),
        }

    def analyze_flow_conditions(
        self,
        discharge: float,
        depth: float,
        velocity: float,
        slope: float,
        manning_n: float,
        channel_width: float,
    ) -> Dict[str, Any]:
        """
        Comprehensive flow analysis

        Args:
            discharge: Flow rate (m³/s)
            depth: Flow depth (m)
            velocity: Flow velocity (m/s)
            slope: Channel slope (m/m)
            manning_n: Manning's roughness coefficient
            channel_width: Channel width (m)

        Returns:
            Dictionary with comprehensive flow analysis
        """
        # Basic calculations
        froude_number = self.calculate_froude_number(velocity, depth)
        energy = self.calculate_energy_head(velocity, depth)

        # Normal and critical depths
        normal_depth_data = self.calculate_normal_depth(
            discharge, slope, manning_n, channel_width
        )
        critical_depth_data = self.calculate_critical_depth(discharge, channel_width)

        # Flow classification
        if froude_number < 1.0:
            flow_type = "Subcritical"
        elif froude_number > 1.0:
            flow_type = "Supercritical"
        else:
            flow_type = "Critical"

        # Flow regime
        if depth > normal_depth_data["normal_depth"]:
            flow_regime = "Backwater"
        elif depth < normal_depth_data["normal_depth"]:
            flow_regime = "Drawdown"
        else:
            flow_regime = "Uniform"

        return {
            "flow_conditions": {
                "discharge": float(discharge),
                "depth": float(depth),
                "velocity": float(velocity),
                "froude_number": float(froude_number),
                "flow_type": flow_type,
                "flow_regime": flow_regime,
            },
            "normal_depth": normal_depth_data,
            "critical_depth": critical_depth_data,
            "energy": energy,
            "channel_parameters": {
                "slope": float(slope),
                "manning_n": float(manning_n),
                "width": float(channel_width),
            },
        }


def main():
    """Command line interface for hydraulic calculations"""
    if len(sys.argv) < 2:
        print("Usage: python hydraulic_calc.py <command> [args...]")
        print("Commands:")
        print("  normal <Q> <S> <n> <B> - Calculate normal depth")
        print("  critical <Q> <B> - Calculate critical depth")
        print("  froude <V> <y> - Calculate Froude number")
        print("  scour <V> <y> <d50> - Calculate scour depth")
        print("  analyze <Q> <y> <V> <S> <n> <B> - Comprehensive analysis")
        sys.exit(1)

    command = sys.argv[1]

    try:
        calc = HydraulicCalculator()

        if command == "normal" and len(sys.argv) >= 6:
            Q, S, n, B = (
                float(sys.argv[2]),
                float(sys.argv[3]),
                float(sys.argv[4]),
                float(sys.argv[5]),
            )
            result = calc.calculate_normal_depth(Q, S, n, B)
            print(json.dumps(result, indent=2))

        elif command == "critical" and len(sys.argv) >= 4:
            Q, B = float(sys.argv[2]), float(sys.argv[3])
            result = calc.calculate_critical_depth(Q, B)
            print(json.dumps(result, indent=2))

        elif command == "froude" and len(sys.argv) >= 4:
            V, y = float(sys.argv[2]), float(sys.argv[3])
            result = calc.calculate_froude_number(V, y)
            print(json.dumps({"froude_number": result}, indent=2))

        elif command == "scour" and len(sys.argv) >= 5:
            V, y, d50 = float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
            result = calc.calculate_scour_depth(V, y, d50)
            print(json.dumps(result, indent=2))

        elif command == "analyze" and len(sys.argv) >= 8:
            Q, y, V, S, n, B = [float(x) for x in sys.argv[2:8]]
            result = calc.analyze_flow_conditions(Q, y, V, S, n, B)
            print(json.dumps(result, indent=2))

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
