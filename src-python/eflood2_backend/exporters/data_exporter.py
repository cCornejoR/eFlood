"""
Export Tools Module
Handles data export to various formats (Excel, PDF, CSV, etc.)
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd

matplotlib.use("Agg")  # Use non-interactive backend

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# Import utilities
from ..utils.common import format_error_message, setup_logging, validate_file_path

# Configure logging
logger = setup_logging()


class DataExporter:
    """Class for exporting data to various formats"""

    def __init__(self):
        """Initialize export tools"""
        self.styles = getSampleStyleSheet()

    def export_to_excel(
        self,
        data: Dict[str, Any],
        output_path: str,
        sheet_names: Optional[List[str]] = None,
    ) -> None:
        """
        Export data to Excel format with multiple sheets

        Args:
            data: Dictionary with data to export
            output_path: Path for output Excel file
            sheet_names: List of sheet names (optional)
        """
        with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
            workbook = writer.book

            # Define formats
            header_format = workbook.add_format(
                {
                    "bold": True,
                    "text_wrap": True,
                    "valign": "top",
                    "fg_color": "#D7E4BC",
                    "border": 1,
                }
            )

            # cell_format = workbook.add_format(
            #     {"text_wrap": True, "valign": "top", "border": 1}
            # )

            for i, (key, value) in enumerate(data.items()):
                sheet_name = (
                    sheet_names[i] if sheet_names and i < len(sheet_names) else key
                )

                if isinstance(value, list) and len(value) > 0:
                    # Convert list of dictionaries to DataFrame
                    if isinstance(value[0], dict):
                        df = pd.DataFrame(value)
                    else:
                        df = pd.DataFrame({key: value})

                elif isinstance(value, dict):
                    # Convert dictionary to DataFrame
                    df = pd.DataFrame([value])

                else:
                    # Single value or other types
                    df = pd.DataFrame({key: [value]})

                # Write to Excel
                df.to_excel(writer, sheet_name=sheet_name, index=False)

                # Get worksheet and apply formatting
                worksheet = writer.sheets[sheet_name]

                # Format headers
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)

                # Auto-adjust column widths
                for i, col in enumerate(df.columns):
                    max_len = max(df[col].astype(str).map(len).max(), len(str(col)))
                    worksheet.set_column(i, i, min(max_len + 2, 50))

    def create_summary_report(
        self,
        project_info: Dict[str, Any],
        hdf_analysis: Dict[str, Any],
        sections_data: List[Dict[str, Any]],
        hydraulic_results: Dict[str, Any],
        output_path: str,
    ) -> None:
        """
        Create a comprehensive PDF report

        Args:
            project_info: Project information
            hdf_analysis: HDF file analysis results
            sections_data: Cross-section data
            hydraulic_results: Hydraulic calculation results
            output_path: Path for output PDF file
        """
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        story = []

        # Title
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=self.styles["Heading1"],
            fontSize=24,
            spaceAfter=30,
            alignment=1,  # Center alignment
        )

        story.append(Paragraph("HEC-RAS 2D Model Analysis Report", title_style))
        story.append(Spacer(1, 20))

        # Project Information Section
        story.append(Paragraph("Project Information", self.styles["Heading2"]))

        project_data = [
            ["Parameter", "Value"],
            ["Project Name", project_info.get("name", "N/A")],
            ["Analysis Date", project_info.get("date", "N/A")],
            ["HDF File", project_info.get("hdf_file", "N/A")],
            ["File Size (MB)", project_info.get("file_size_mb", "N/A")],
        ]

        project_table = Table(project_data)
        project_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 14),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )

        story.append(project_table)
        story.append(Spacer(1, 20))

        # HDF Analysis Section
        story.append(Paragraph("HDF File Analysis", self.styles["Heading2"]))

        hydraulic_datasets = hdf_analysis.get("hydraulic_results", {})
        hdf_data = [["Dataset Type", "Count", "Datasets"]]

        for dataset_type, datasets in hydraulic_datasets.items():
            if datasets:
                datasets_str = ", ".join(datasets[:3])  # Show first 3
                if len(datasets) > 3:
                    datasets_str += f" ... (+{len(datasets)-3} more)"
                hdf_data.append(
                    [dataset_type.title(), str(len(datasets)), datasets_str]
                )

        hdf_table = Table(hdf_data, colWidths=[2 * inch, 1 * inch, 4 * inch])
        hdf_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 12),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )

        story.append(hdf_table)
        story.append(Spacer(1, 20))

        # Cross-Sections Summary
        if sections_data:
            story.append(Paragraph("Cross-Sections Summary", self.styles["Heading2"]))

            sections_summary = [
                ["Parameter", "Value"],
                ["Total Sections", str(len(sections_data))],
                [
                    "Average Length (m)",
                    f"{sum(s.get('total_length', 0) for s in sections_data) / len(sections_data):.2f}",
                ],
            ]

            if sections_data:
                elevations = []
                for section in sections_data:
                    section_elevs = [
                        e for e in section.get("elevations", []) if not pd.isna(e)
                    ]
                    elevations.extend(section_elevs)

                if elevations:
                    sections_summary.extend(
                        [
                            ["Min Elevation (m)", f"{min(elevations):.2f}"],
                            ["Max Elevation (m)", f"{max(elevations):.2f}"],
                            [
                                "Elevation Range (m)",
                                f"{max(elevations) - min(elevations):.2f}",
                            ],
                        ]
                    )

            sections_table = Table(sections_summary)
            sections_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )

            story.append(sections_table)
            story.append(Spacer(1, 20))

        # Hydraulic Results Summary
        if hydraulic_results:
            story.append(
                Paragraph("Hydraulic Analysis Results", self.styles["Heading2"])
            )

            # Create summary table from hydraulic results
            hydraulic_data = [["Parameter", "Value", "Units"]]

            for key, value in hydraulic_results.items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        if isinstance(sub_value, (int, float)):
                            unit = self._get_parameter_unit(sub_key)
                            hydraulic_data.append(
                                [
                                    sub_key.replace("_", " ").title(),
                                    (
                                        f"{sub_value:.3f}"
                                        if isinstance(sub_value, float)
                                        else str(sub_value)
                                    ),
                                    unit,
                                ]
                            )
                elif isinstance(value, (int, float)):
                    unit = self._get_parameter_unit(key)
                    hydraulic_data.append(
                        [
                            key.replace("_", " ").title(),
                            f"{value:.3f}" if isinstance(value, float) else str(value),
                            unit,
                        ]
                    )

            hydraulic_table = Table(
                hydraulic_data, colWidths=[3 * inch, 2 * inch, 1 * inch]
            )
            hydraulic_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )

            story.append(hydraulic_table)

        # Build PDF
        doc.build(story)

    def _get_parameter_unit(self, parameter: str) -> str:
        """Get appropriate unit for a parameter"""
        units_map = {
            "depth": "m",
            "velocity": "m/s",
            "discharge": "m³/s",
            "area": "m²",
            "width": "m",
            "length": "m",
            "elevation": "m",
            "slope": "m/m",
            "froude_number": "-",
            "manning_n": "-",
            "scour_depth": "m",
            "hydraulic_radius": "m",
            "wetted_perimeter": "m",
            "energy": "m",
        }

        for key, unit in units_map.items():
            if key in parameter.lower():
                return unit

        return "-"

    def export_to_csv(
        self,
        data: List[Dict[str, Any]],
        output_path: str,
        columns: Optional[List[str]] = None,
    ) -> None:
        """
        Export data to CSV format

        Args:
            data: List of dictionaries to export
            output_path: Path for output CSV file
            columns: Specific columns to export (optional)
        """
        df = pd.DataFrame(data)

        if columns:
            # Select only specified columns that exist in the data
            available_columns = [col for col in columns if col in df.columns]
            df = df[available_columns]

        df.to_csv(output_path, index=False)

    def create_visualization_report(
        self, sections_data: List[Dict[str, Any]], output_dir: str
    ) -> List[str]:
        """
        Create visualization plots for sections

        Args:
            sections_data: List of section data
            output_dir: Directory for output plots

        Returns:
            List of created plot file paths
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        created_files = []

        for i, section in enumerate(sections_data[:10]):  # Limit to first 10 sections
            try:
                distances = section.get("distances", [])
                elevations = section.get("elevations", [])

                if not distances or not elevations:
                    continue

                # Filter out NaN values
                valid_data = [
                    (d, e) for d, e in zip(distances, elevations) if not pd.isna(e)
                ]
                if not valid_data:
                    continue

                distances_clean, elevations_clean = zip(*valid_data)

                plt.figure(figsize=(10, 6))
                plt.plot(distances_clean, elevations_clean, "b-", linewidth=2)
                plt.fill_between(
                    distances_clean,
                    elevations_clean,
                    min(elevations_clean) - 1,
                    alpha=0.3,
                    color="brown",
                )

                plt.xlabel("Distance (m)")
                plt.ylabel("Elevation (m)")
                plt.title(
                    f"Cross-Section {section.get('section_id', i+1)} - Station {section.get('station', 'N/A')}"
                )
                plt.grid(True, alpha=0.3)

                output_path = output_dir / f"section_{i+1:03d}.png"
                plt.savefig(output_path, dpi=300, bbox_inches="tight")
                plt.close()

                created_files.append(str(output_path))

            except Exception as e:
                print(f"Warning: Failed to create plot for section {i+1}: {e}")

        return created_files


def main():
    """Command line interface for export tools"""
    if len(sys.argv) < 2:
        print("Usage: python export_tools.py <command> [args...]")
        print("Commands:")
        print("  excel <data.json> <output.xlsx> - Export to Excel")
        print("  csv <data.json> <output.csv> - Export to CSV")
        print(
            "  pdf <project.json> <hdf.json> <sections.json> <hydraulic.json> <output.pdf> - Create PDF report"
        )
        sys.exit(1)

    command = sys.argv[1]

    try:
        tools = ExportTools()

        if command == "excel" and len(sys.argv) >= 4:
            data_file = sys.argv[2]
            output_file = sys.argv[3]

            with open(data_file, "r") as f:
                data = json.load(f)

            tools.export_to_excel(data, output_file)
            print(f"Excel file created: {output_file}")

        elif command == "csv" and len(sys.argv) >= 4:
            data_file = sys.argv[2]
            output_file = sys.argv[3]

            with open(data_file, "r") as f:
                data = json.load(f)

            if isinstance(data, list):
                tools.export_to_csv(data, output_file)
            else:
                tools.export_to_csv([data], output_file)

            print(f"CSV file created: {output_file}")

        elif command == "pdf" and len(sys.argv) >= 7:
            project_file = sys.argv[2]
            hdf_file = sys.argv[3]
            sections_file = sys.argv[4]
            hydraulic_file = sys.argv[5]
            output_file = sys.argv[6]

            with open(project_file, "r") as f:
                project_info = json.load(f)
            with open(hdf_file, "r") as f:
                hdf_analysis = json.load(f)
            with open(sections_file, "r") as f:
                sections_data = json.load(f)
            with open(hydraulic_file, "r") as f:
                hydraulic_results = json.load(f)

            tools.create_summary_report(
                project_info,
                hdf_analysis,
                sections_data,
                hydraulic_results,
                output_file,
            )
            print(f"PDF report created: {output_file}")

        else:
            print(f"Unknown command or insufficient arguments: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
