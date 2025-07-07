"""
Hydraulic Plots Module for HEC-RAS 2D Models
Specialized plotting functions for hydraulic data visualization
"""

import base64
import io
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Rectangle

# Import utilities
from ..utils.common import format_error_message, setup_logging, validate_file_path

# Configure matplotlib for better hydraulic plots
plt.style.use("default")
plt.rcParams["figure.facecolor"] = "white"
plt.rcParams["axes.facecolor"] = "white"
plt.rcParams["axes.grid"] = True
plt.rcParams["grid.alpha"] = 0.3


class HydraulicPlotter:
    """Class for creating specialized hydraulic plots"""

    def __init__(self):
        """Initialize hydraulic plotter"""
        # Define hydraulic color schemes
        self.water_colors = ["#0066cc", "#0080ff", "#3399ff", "#66b3ff"]
        self.velocity_colors = ["#ff6600", "#ff8533", "#ffaa66", "#ffcc99"]
        self.depth_colors = ["#006600", "#009900", "#33cc33", "#66ff66"]

    def create_water_surface_plot(
        self,
        data: np.ndarray,
        time_hours: Optional[np.ndarray] = None,
        title: str = "Water Surface Elevation",
    ) -> str:
        """
        Create water surface elevation plot

        Args:
            data: Water surface elevation data
            time_hours: Time array in hours
            title: Plot title

        Returns:
            Base64 encoded PNG image
        """
        try:
            fig, ax = plt.subplots(figsize=(14, 8))

            if time_hours is None:
                time_hours = np.arange(len(data))

            # Plot water surface with fill
            ax.fill_between(
                time_hours,
                data,
                alpha=0.4,
                color=self.water_colors[0],
                label="Water Surface",
            )
            ax.plot(time_hours, data, linewidth=2, color=self.water_colors[1])

            # Add statistics
            max_wse = np.max(data)
            min_wse = np.min(data)
            mean_wse = np.mean(data)

            # Add horizontal lines for statistics
            ax.axhline(
                y=max_wse,
                color="red",
                linestyle="--",
                alpha=0.7,
                label=f"Máximo: {max_wse:.2f} m",
            )
            ax.axhline(
                y=mean_wse,
                color="orange",
                linestyle="--",
                alpha=0.7,
                label=f"Promedio: {mean_wse:.2f} m",
            )
            ax.axhline(
                y=min_wse,
                color="green",
                linestyle="--",
                alpha=0.7,
                label=f"Mínimo: {min_wse:.2f} m",
            )

            ax.set_xlabel("Tiempo (horas)", fontsize=12)
            ax.set_ylabel("Elevación de Superficie de Agua (m)", fontsize=12)
            ax.set_title(title, fontsize=16, fontweight="bold")
            ax.legend(loc="upper right")
            ax.grid(True, alpha=0.3)

            plt.tight_layout()
            return self._fig_to_base64(fig)

        except Exception as e:
            raise Exception(f"Error creating water surface plot: {str(e)}")

    def create_velocity_plot(
        self,
        data: np.ndarray,
        time_hours: Optional[np.ndarray] = None,
        title: str = "Velocity",
    ) -> str:
        """
        Create velocity plot with flow regime indicators

        Args:
            data: Velocity data
            time_hours: Time array in hours
            title: Plot title

        Returns:
            Base64 encoded PNG image
        """
        try:
            fig, ax = plt.subplots(figsize=(14, 8))

            if time_hours is None:
                time_hours = np.arange(len(data))

            # Plot velocity
            ax.plot(time_hours, data, linewidth=2, color=self.velocity_colors[0])
            ax.fill_between(time_hours, data, alpha=0.3, color=self.velocity_colors[1])

            # Add flow regime zones
            critical_velocity = 1.0  # Approximate critical velocity
            high_velocity = 3.0  # High velocity threshold

            # Color zones
            ax.axhspan(
                0, critical_velocity, alpha=0.1, color="green", label="Flujo Subcrítico"
            )
            ax.axhspan(
                critical_velocity,
                high_velocity,
                alpha=0.1,
                color="yellow",
                label="Flujo Crítico",
            )
            ax.axhspan(
                high_velocity,
                np.max(data) * 1.1,
                alpha=0.1,
                color="red",
                label="Flujo Supercrítico",
            )

            # Statistics
            max_vel = np.max(data)
            mean_vel = np.mean(data)

            ax.set_xlabel("Tiempo (horas)", fontsize=12)
            ax.set_ylabel("Velocidad (m/s)", fontsize=12)
            ax.set_title(title, fontsize=16, fontweight="bold")
            ax.legend(loc="upper right")
            ax.grid(True, alpha=0.3)

            # Add statistics text
            stats_text = f"Máx: {max_vel:.2f} m/s\nProm: {mean_vel:.2f} m/s"
            ax.text(
                0.02,
                0.98,
                stats_text,
                transform=ax.transAxes,
                verticalalignment="top",
                bbox=dict(boxstyle="round", facecolor="lightblue", alpha=0.8),
            )

            plt.tight_layout()
            return self._fig_to_base64(fig)

        except Exception as e:
            raise Exception(f"Error creating velocity plot: {str(e)}")

    def create_depth_plot(
        self,
        data: np.ndarray,
        time_hours: Optional[np.ndarray] = None,
        title: str = "Water Depth",
    ) -> str:
        """
        Create water depth plot

        Args:
            data: Water depth data
            time_hours: Time array in hours
            title: Plot title

        Returns:
            Base64 encoded PNG image
        """
        try:
            fig, ax = plt.subplots(figsize=(14, 8))

            if time_hours is None:
                time_hours = np.arange(len(data))

            # Plot depth with gradient fill
            ax.fill_between(time_hours, data, alpha=0.4, color=self.depth_colors[0])
            ax.plot(time_hours, data, linewidth=2, color=self.depth_colors[1])

            # Add depth categories
            shallow = 0.5  # Shallow water threshold
            moderate = 2.0  # Moderate depth threshold

            ax.axhspan(
                0, shallow, alpha=0.1, color="yellow", label="Agua Poco Profunda"
            )
            ax.axhspan(
                shallow, moderate, alpha=0.1, color="blue", label="Profundidad Moderada"
            )
            ax.axhspan(
                moderate,
                np.max(data) * 1.1,
                alpha=0.1,
                color="darkblue",
                label="Agua Profunda",
            )

            ax.set_xlabel("Tiempo (horas)", fontsize=12)
            ax.set_ylabel("Tirante de Agua (m)", fontsize=12)
            ax.set_title(title, fontsize=16, fontweight="bold")
            ax.legend(loc="upper right")
            ax.grid(True, alpha=0.3)

            plt.tight_layout()
            return self._fig_to_base64(fig)

        except Exception as e:
            raise Exception(f"Error creating depth plot: {str(e)}")

    def create_hydrograph_advanced(
        self,
        discharge_data: np.ndarray,
        time_hours: Optional[np.ndarray] = None,
        stage_data: Optional[np.ndarray] = None,
        title: str = "Hidrograma Avanzado",
    ) -> str:
        """
        Create advanced hydrograph with dual y-axis

        Args:
            discharge_data: Discharge data
            time_hours: Time array in hours
            stage_data: Optional stage/water level data
            title: Plot title

        Returns:
            Base64 encoded PNG image
        """
        try:
            fig, ax1 = plt.subplots(figsize=(16, 10))

            if time_hours is None:
                time_hours = np.arange(len(discharge_data))

            # Plot discharge
            color1 = self.water_colors[0]
            ax1.set_xlabel("Tiempo (horas)", fontsize=12)
            ax1.set_ylabel("Caudal (m³/s)", color=color1, fontsize=12)
            ax1.fill_between(time_hours, discharge_data, alpha=0.3, color=color1)
            line1 = ax1.plot(
                time_hours, discharge_data, color=color1, linewidth=2, label="Caudal"
            )[0]
            ax1.tick_params(axis="y", labelcolor=color1)
            ax1.grid(True, alpha=0.3)

            lines = [line1]
            labels = ["Caudal (m³/s)"]

            # Plot stage data if available
            if stage_data is not None:
                ax2 = ax1.twinx()
                color2 = self.velocity_colors[0]
                ax2.set_ylabel("Nivel de Agua (m)", color=color2, fontsize=12)
                line2 = ax2.plot(
                    time_hours,
                    stage_data,
                    color=color2,
                    linewidth=2,
                    linestyle="--",
                    label="Nivel",
                )[0]
                ax2.tick_params(axis="y", labelcolor=color2)
                lines.append(line2)
                labels.append("Nivel (m)")

            # Add peak flow annotation
            peak_idx = np.argmax(discharge_data)
            peak_flow = discharge_data[peak_idx]
            peak_time = time_hours[peak_idx]

            ax1.annotate(
                f"Pico: {peak_flow:.1f} m³/s\nt = {peak_time:.1f} h",
                xy=(peak_time, peak_flow),
                xytext=(peak_time + len(time_hours) * 0.1, peak_flow),
                arrowprops=dict(arrowstyle="->", color="red", lw=2),
                fontsize=10,
                bbox=dict(boxstyle="round", facecolor="yellow", alpha=0.8),
            )

            ax1.set_title(title, fontsize=16, fontweight="bold")
            ax1.legend(lines, labels, loc="upper left")

            plt.tight_layout()
            return self._fig_to_base64(fig)

        except Exception as e:
            raise Exception(f"Error creating advanced hydrograph: {str(e)}")

    def create_flow_duration_curve(
        self, data: np.ndarray, title: str = "Curva de Duración de Caudales"
    ) -> str:
        """
        Create flow duration curve

        Args:
            data: Flow data
            title: Plot title

        Returns:
            Base64 encoded PNG image
        """
        try:
            fig, ax = plt.subplots(figsize=(12, 8))

            # Sort data in descending order
            sorted_data = np.sort(data)[::-1]

            # Calculate exceedance probabilities
            n = len(sorted_data)
            exceedance = np.arange(1, n + 1) / n * 100

            # Plot flow duration curve
            ax.semilogy(
                exceedance, sorted_data, linewidth=2, color=self.water_colors[0]
            )
            ax.fill_between(
                exceedance, sorted_data, alpha=0.3, color=self.water_colors[1]
            )

            # Add percentile lines
            percentiles = [10, 25, 50, 75, 90]
            for p in percentiles:
                idx = int(p / 100 * n)
                if idx < n:
                    flow_value = sorted_data[idx]
                    ax.axhline(y=flow_value, color="red", linestyle="--", alpha=0.7)
                    ax.text(
                        p,
                        flow_value * 1.1,
                        f"Q{p}: {flow_value:.1f}",
                        fontsize=9,
                        ha="center",
                    )

            ax.set_xlabel("Porcentaje de Tiempo Excedido (%)", fontsize=12)
            ax.set_ylabel("Caudal (m³/s)", fontsize=12)
            ax.set_title(title, fontsize=16, fontweight="bold")
            ax.grid(True, alpha=0.3)

            plt.tight_layout()
            return self._fig_to_base64(fig)

        except Exception as e:
            raise Exception(f"Error creating flow duration curve: {str(e)}")

    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string"""
        buffer = io.BytesIO()
        fig.savefig(
            buffer,
            format="png",
            dpi=150,
            bbox_inches="tight",
            facecolor="white",
            edgecolor="none",
        )
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)
        return image_base64


def main():
    """Command line interface for hydraulic plotting"""
    if len(sys.argv) < 3:
        print("Usage: python hydraulic_plots.py <command> <data_file> [options]")
        print("Commands:")
        print("  water_surface <data_file> - Create water surface plot")
        print("  velocity <data_file> - Create velocity plot")
        print("  depth <data_file> - Create depth plot")
        print("  hydrograph <data_file> - Create advanced hydrograph")
        print("  duration_curve <data_file> - Create flow duration curve")
        sys.exit(1)

    command = sys.argv[1]
    data_file = sys.argv[2]

    try:
        # Load data from JSON file
        with open(data_file, "r") as f:
            data_dict = json.load(f)

        data = np.array(data_dict.get("data", []))
        time_hours = np.array(data_dict.get("time_hours", []))

        if len(time_hours) == 0:
            time_hours = None

        plotter = HydraulicPlotter()

        if command == "water_surface":
            image_base64 = plotter.create_water_surface_plot(data, time_hours)
        elif command == "velocity":
            image_base64 = plotter.create_velocity_plot(data, time_hours)
        elif command == "depth":
            image_base64 = plotter.create_depth_plot(data, time_hours)
        elif command == "hydrograph":
            stage_data = (
                np.array(data_dict.get("stage_data", []))
                if "stage_data" in data_dict
                else None
            )
            image_base64 = plotter.create_hydrograph_advanced(
                data, time_hours, stage_data
            )
        elif command == "duration_curve":
            image_base64 = plotter.create_flow_duration_curve(data)
        else:
            raise ValueError(f"Unknown command: {command}")

        result = {"success": True, "image": image_base64}
        print(json.dumps(result))

    except Exception as e:
        error_result = {"success": False, "error": str(e)}
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
