"""
Hydraulic Calculator Module
Implements hydraulic calculation algorithms for HEC-RAS 2D models
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
        flow_rate: float,
        slope: float,
        manning_n: float,
        channel_width: float,
        channel_shape: str = "rectangular",
    ) -> Dict[str, Any]:
        """
        Calculate normal depth using Manning's equation

        Args:
            flow_rate: Flow rate in m³/s
            slope: Channel slope (m/m)
            manning_n: Manning's roughness coefficient
            channel_width: Channel width in meters
            channel_shape: Channel shape ("rectangular", "trapezoidal")

        Returns:
            Dictionary with normal depth results
        """
        try:
            if channel_shape == "rectangular":
                # For rectangular channel: Q = (1/n) * A * R^(2/3) * S^(1/2)
                # Where A = b*y, R = (b*y)/(b+2*y), b = width, y = depth

                # Iterative solution for normal depth
                depth = self._solve_normal_depth_rectangular(
                    flow_rate, slope, manning_n, channel_width
                )

                area = channel_width * depth
                wetted_perimeter = channel_width + 2 * depth
                hydraulic_radius = (
                    area / wetted_perimeter if wetted_perimeter > 0 else 0
                )
                velocity = flow_rate / area if area > 0 else 0

                return {
                    "success": True,
                    "normal_depth": depth,
                    "area": area,
                    "wetted_perimeter": wetted_perimeter,
                    "hydraulic_radius": hydraulic_radius,
                    "velocity": velocity,
                    "flow_rate": flow_rate,
                    "slope": slope,
                    "manning_n": manning_n,
                    "channel_width": channel_width,
                    "channel_shape": channel_shape,
                }
            else:
                raise ValueError(f"Channel shape '{channel_shape}' not implemented yet")

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "normal_depth": 0,
                "flow_rate": flow_rate,
                "slope": slope,
                "manning_n": manning_n,
                "channel_width": channel_width,
            }

    def calculate_critical_depth(
        self, flow_rate: float, channel_width: float, channel_shape: str = "rectangular"
    ) -> Dict[str, Any]:
        """
        Calculate critical depth

        Args:
            flow_rate: Flow rate in m³/s
            channel_width: Channel width in meters
            channel_shape: Channel shape

        Returns:
            Dictionary with critical depth results
        """
        try:
            if channel_shape == "rectangular":
                # For rectangular channel: yc = (Q²/(g*b²))^(1/3)
                critical_depth = (
                    flow_rate**2 / (self.gravity * channel_width**2)
                ) ** (1 / 3)

                area = channel_width * critical_depth
                velocity = flow_rate / area if area > 0 else 0
                froude_number = (
                    velocity / math.sqrt(self.gravity * critical_depth)
                    if critical_depth > 0
                    else 0
                )

                return {
                    "success": True,
                    "critical_depth": critical_depth,
                    "area": area,
                    "velocity": velocity,
                    "froude_number": froude_number,
                    "flow_rate": flow_rate,
                    "channel_width": channel_width,
                    "channel_shape": channel_shape,
                }
            else:
                raise ValueError(f"Channel shape '{channel_shape}' not implemented yet")

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "critical_depth": 0,
                "flow_rate": flow_rate,
                "channel_width": channel_width,
            }

    def analyze_flow_conditions(
        self,
        flow_rate: float,
        actual_depth: float,
        channel_width: float,
        slope: float,
        manning_n: float,
        channel_shape: str = "rectangular",
    ) -> Dict[str, Any]:
        """
        Analyze flow conditions (subcritical, critical, supercritical)

        Args:
            flow_rate: Flow rate in m³/s
            actual_depth: Actual water depth in meters
            channel_width: Channel width in meters
            slope: Channel slope
            manning_n: Manning's coefficient
            channel_shape: Channel shape

        Returns:
            Dictionary with flow analysis results
        """
        try:
            # Calculate critical depth
            critical_result = self.calculate_critical_depth(
                flow_rate, channel_width, channel_shape
            )
            critical_depth = critical_result.get("critical_depth", 0)

            # Calculate normal depth
            normal_result = self.calculate_normal_depth(
                flow_rate, slope, manning_n, channel_width, channel_shape
            )
            normal_depth = normal_result.get("normal_depth", 0)

            # Calculate current flow properties
            area = channel_width * actual_depth
            velocity = flow_rate / area if area > 0 else 0
            froude_number = (
                velocity / math.sqrt(self.gravity * actual_depth)
                if actual_depth > 0
                else 0
            )

            # Determine flow regime
            if froude_number < 1.0:
                flow_regime = "subcritical"
            elif froude_number > 1.0:
                flow_regime = "supercritical"
            else:
                flow_regime = "critical"

            return {
                "success": True,
                "flow_regime": flow_regime,
                "froude_number": froude_number,
                "actual_depth": actual_depth,
                "critical_depth": critical_depth,
                "normal_depth": normal_depth,
                "velocity": velocity,
                "area": area,
                "flow_rate": flow_rate,
                "channel_width": channel_width,
                "slope": slope,
                "manning_n": manning_n,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "flow_regime": "unknown",
                "froude_number": 0,
            }

    def _solve_normal_depth_rectangular(
        self,
        flow_rate: float,
        slope: float,
        manning_n: float,
        width: float,
        max_iterations: int = 100,
        tolerance: float = 1e-6,
    ) -> float:
        """
        Solve normal depth for rectangular channel using Newton-Raphson method
        """
        # Initial guess
        depth = (flow_rate * manning_n / (width * math.sqrt(slope))) ** (3 / 5)

        for _ in range(max_iterations):
            area = width * depth
            wetted_perimeter = width + 2 * depth
            hydraulic_radius = area / wetted_perimeter

            # Manning's equation: Q = (1/n) * A * R^(2/3) * S^(1/2)
            calculated_flow = (
                (1 / manning_n)
                * area
                * (hydraulic_radius ** (2 / 3))
                * math.sqrt(slope)
            )

            # Function and derivative for Newton-Raphson
            f = calculated_flow - flow_rate

            if abs(f) < tolerance:
                break

            # Derivative calculation
            dA_dy = width
            dP_dy = 2
            dR_dy = (dA_dy * wetted_perimeter - area * dP_dy) / (wetted_perimeter**2)

            df_dy = (
                (1 / manning_n)
                * math.sqrt(slope)
                * (
                    dA_dy * (hydraulic_radius ** (2 / 3))
                    + area * (2 / 3) * (hydraulic_radius ** (-1 / 3)) * dR_dy
                )
            )

            if abs(df_dy) < 1e-12:
                break

            depth = depth - f / df_dy

            # Ensure positive depth
            depth = max(depth, 0.001)

        return depth


def main():
    """Command line interface for hydraulic calculations"""
    if len(sys.argv) < 2:
        print("Usage: python hydraulic_calculator.py <command> [args...]")
        print("Commands:")
        print("  normal <flow> <slope> <manning_n> <width> - Calculate normal depth")
        print("  critical <flow> <width> - Calculate critical depth")
        print(
            "  analyze <flow> <depth> <width> <slope> <manning_n> - Analyze flow conditions"
        )
        sys.exit(1)

    command = sys.argv[1]

    try:
        calc = HydraulicCalculator()

        if command == "normal" and len(sys.argv) >= 6:
            flow = float(sys.argv[2])
            slope = float(sys.argv[3])
            manning_n = float(sys.argv[4])
            width = float(sys.argv[5])

            result = calc.calculate_normal_depth(flow, slope, manning_n, width)
            print(json.dumps(result, indent=2))

        elif command == "critical" and len(sys.argv) >= 4:
            flow = float(sys.argv[2])
            width = float(sys.argv[3])

            result = calc.calculate_critical_depth(flow, width)
            print(json.dumps(result, indent=2))

        elif command == "analyze" and len(sys.argv) >= 7:
            flow = float(sys.argv[2])
            depth = float(sys.argv[3])
            width = float(sys.argv[4])
            slope = float(sys.argv[5])
            manning_n = float(sys.argv[6])

            result = calc.analyze_flow_conditions(flow, depth, width, slope, manning_n)
            print(json.dumps(result, indent=2))

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
