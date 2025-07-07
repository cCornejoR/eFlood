"""
HDF Data Extractor Module for HEC-RAS 2D Models
Handles extraction, visualization, and export of HDF5 data
"""

import json
import sys
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import io
import base64

import h5py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta

# Import utilities
from ..utils.common import setup_logging, validate_file_path, format_error_message

# Configure matplotlib for better plots
plt.style.use('default')

# Configure logging
logger = setup_logging()


class DataExtractor:
    """Class for extracting and visualizing data from HEC-RAS HDF files"""

    def __init__(self, file_path: str):
        """
        Initialize HDF data extractor with file path

        Args:
            file_path (str): Path to the HDF file
        """
        self.file_path = Path(file_path)

        # Validate file exists
        if not self.file_path.exists():
            raise FileNotFoundError(f"HDF file not found: {file_path}")

    def clean_hydrograph_data(self, data: np.ndarray) -> Dict[str, Any]:
        """
        Clean and format data for hydrograph visualization

        Args:
            data: Raw numpy array data

        Returns:
            Dict containing cleaned data with index and column_2
        """
        try:
            cleaned_data = []

            if data.ndim == 1:
                # 1D data - create index and use data as column_2
                for i, value in enumerate(data):
                    if not (np.isnan(value) or np.isinf(value)):  # Skip invalid values
                        cleaned_data.append({
                            "index": i,
                            "column_2": float(value)
                        })
            elif data.ndim == 2:
                # 2D data - use first column as index, second as column_2
                for i, row in enumerate(data):
                    if len(row) >= 2:
                        index_val = row[0] if not (np.isnan(row[0]) or np.isinf(row[0])) else i
                        col2_val = row[1] if not (np.isnan(row[1]) or np.isinf(row[1])) else 0
                        cleaned_data.append({
                            "index": float(index_val),
                            "column_2": float(col2_val)
                        })
                    elif len(row) >= 1:
                        # Only one column available, use row index as index
                        col2_val = row[0] if not (np.isnan(row[0]) or np.isinf(row[0])) else 0
                        cleaned_data.append({
                            "index": i,
                            "column_2": float(col2_val)
                        })

            return {
                "cleaned_data": cleaned_data,
                "total_points": len(cleaned_data),
                "columns": ["index", "column_2"]
            }

        except Exception as e:
            raise Exception(f"Error cleaning hydrograph data: {str(e)}")

    def extract_dataset_data(self, dataset_path: str, max_rows: int = 1000, clean_for_hydrograph: bool = True) -> Dict[str, Any]:
        """
        Extract data from a specific dataset with metadata and optional cleaning

        Args:
            dataset_path (str): Path to the dataset within the HDF file
            max_rows (int): Maximum number of rows to extract for preview
            clean_for_hydrograph (bool): Whether to clean data for hydrograph visualization

        Returns:
            Dict containing data, metadata, and summary statistics
        """
        try:
            with h5py.File(self.file_path, "r") as f:
                if dataset_path not in f:
                    raise KeyError(f"Dataset not found: {dataset_path}")

                dataset = f[dataset_path]

                # Extract metadata
                attrs_dict = {}
                for key, value in dataset.attrs.items():
                    if isinstance(value, bytes):
                        attrs_dict[key] = value.decode('utf-8', errors='ignore')
                    elif isinstance(value, np.ndarray):
                        attrs_dict[key] = value.tolist()
                    else:
                        attrs_dict[key] = str(value)

                metadata = {
                    "shape": list(dataset.shape),
                    "dtype": str(dataset.dtype),
                    "size": int(dataset.size),
                    "attrs": attrs_dict,
                    "ndim": int(dataset.ndim)
                }

                # Extract data (limit for large datasets)
                if dataset.size > max_rows * 10:  # Limit large datasets
                    data = dataset[:max_rows] if dataset.ndim == 1 else dataset[:max_rows, :]
                    is_truncated = True
                    truncated_at = max_rows
                else:
                    data = dataset[:]
                    is_truncated = False
                    truncated_at = None

                # Clean data for hydrograph if requested
                if clean_for_hydrograph:
                    cleaned_result = self.clean_hydrograph_data(data)
                    data_list = cleaned_result["cleaned_data"]

                    # Apply max_rows limit to cleaned data
                    if len(data_list) > max_rows:
                        data_list = data_list[:max_rows]
                        is_truncated = True
                        truncated_at = max_rows

                    # Calculate summary statistics from cleaned data
                    if data_list:
                        values = [item["column_2"] for item in data_list]
                        summary_stats = {
                            "min": float(min(values)),
                            "max": float(max(values)),
                            "mean": float(np.mean(values)),
                            "std": float(np.std(values)),
                            "count": len(values)
                        }
                    else:
                        summary_stats = {}

                    metadata["is_cleaned"] = True
                    metadata["columns"] = cleaned_result["columns"]

                else:
                    # Original data processing
                    if isinstance(data, np.ndarray):
                        if data.ndim == 1:
                            data_list = data.tolist()
                        else:
                            data_list = data.tolist()
                    else:
                        data_list = data

                    # Calculate summary statistics for numeric data
                    summary_stats = {}
                    if isinstance(data, np.ndarray) and np.issubdtype(data.dtype, np.number):
                        summary_stats = {
                            "min": float(np.min(data)),
                            "max": float(np.max(data)),
                            "mean": float(np.mean(data)),
                            "std": float(np.std(data)),
                            "count": int(data.size)
                        }

                    metadata["is_cleaned"] = False

                # Add truncation info to metadata
                metadata["is_truncated"] = is_truncated
                metadata["truncated_at"] = truncated_at

                return {
                    "data": data_list,
                    "metadata": metadata,
                    "summary_stats": summary_stats,
                    "dataset_path": dataset_path
                }

        except Exception as e:
            raise Exception(f"Error extracting dataset {dataset_path}: {str(e)}")

    def create_time_series_plot(self, dataset_path: str, title: Optional[str] = None) -> str:
        """
        Create a time series plot from HDF dataset

        Args:
            dataset_path (str): Path to the dataset
            title (str): Optional title for the plot

        Returns:
            Base64 encoded PNG image of the plot
        """
        try:
            with h5py.File(self.file_path, "r") as f:
                if dataset_path not in f:
                    raise KeyError(f"Dataset not found: {dataset_path}")

                dataset = f[dataset_path]
                data = dataset[:]

                # Create figure
                fig, ax = plt.subplots(figsize=(12, 6))

                if data.ndim == 1:
                    # Simple line plot for 1D data
                    ax.plot(data, linewidth=2, color='#2563eb')
                    ax.set_xlabel('Index')
                    ax.set_ylabel('Value')
                elif data.ndim == 2:
                    # Multiple series or time series
                    if data.shape[1] <= 10:  # Plot multiple series if not too many
                        for i in range(data.shape[1]):
                            ax.plot(data[:, i], label=f'Series {i+1}', linewidth=1.5)
                        ax.legend()
                    else:
                        # Plot first few series only
                        for i in range(5):
                            ax.plot(data[:, i], label=f'Series {i+1}', linewidth=1.5)
                        ax.legend()
                        ax.text(0.02, 0.98, f'Showing 5 of {data.shape[1]} series',
                               transform=ax.transAxes, verticalalignment='top',
                               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

                    ax.set_xlabel('Time Step')
                    ax.set_ylabel('Value')

                # Set title
                plot_title = title or f'Data Visualization: {dataset_path.split("/")[-1]}'
                ax.set_title(plot_title, fontsize=14, fontweight='bold')

                # Improve plot appearance
                ax.grid(True, alpha=0.3)
                ax.spines['top'].set_visible(False)
                ax.spines['right'].set_visible(False)

                plt.tight_layout()

                # Convert to base64
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                image_base64 = base64.b64encode(buffer.getvalue()).decode()
                plt.close(fig)

                return image_base64

        except Exception as e:
            raise Exception(f"Error creating plot for {dataset_path}: {str(e)}")

    def create_hydrograph(self, dataset_path: str, time_column: Optional[str] = None) -> str:
        """
        Create a hydrograph from HDF dataset using cleaned data

        Args:
            dataset_path (str): Path to the dataset
            time_column (str): Optional time column name (unused, kept for compatibility)

        Returns:
            Base64 encoded PNG image of the hydrograph
        """
        try:
            # Get cleaned data for hydrograph
            data_info = self.extract_dataset_data(dataset_path, max_rows=10000, clean_for_hydrograph=True)
            cleaned_data = data_info["data"]

            if not cleaned_data:
                raise ValueError("No valid data found for hydrograph")

            # Extract index and column_2 values
            x_values = np.array([item["index"] for item in cleaned_data])
            y_values = np.array([item["column_2"] for item in cleaned_data])

            # Create figure
            fig, ax = plt.subplots(figsize=(14, 8))

            # Create hydrograph plot
            ax.fill_between(x_values, y_values, alpha=0.3, color='#3b82f6', label='Área bajo la curva')
            ax.plot(x_values, y_values, linewidth=2, color='#1d4ed8', label='Hidrograma')

            # Set labels and title
            ax.set_xlabel('Índice de Tiempo', fontsize=12)
            ax.set_ylabel('Caudal/Nivel de Agua', fontsize=12)
            ax.set_title(f'Hidrograma: {dataset_path.split("/")[-1]}',
                        fontsize=16, fontweight='bold')

            # Add legend and grid
            ax.legend()

            # Improve plot appearance
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)

            # Add statistics text box using cleaned data
            if y_values:
                stats_text = f'Max: {max(y_values):.2f}\nMin: {min(y_values):.2f}\nMean: {np.mean(y_values):.2f}'
                ax.text(0.02, 0.98, stats_text, transform=ax.transAxes,
                       verticalalignment='top', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))

            plt.tight_layout()

            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close(fig)

            return image_base64

        except Exception as e:
            raise Exception(f"Error creating hydrograph for {dataset_path}: {str(e)}")

    def export_to_csv(self, dataset_path: str, output_path: Optional[str] = None) -> str:
        """
        Export dataset to CSV format

        Args:
            dataset_path (str): Path to the dataset
            output_path (str): Optional output file path

        Returns:
            Path to the created CSV file or CSV content as string
        """
        try:
            data_info = self.extract_dataset_data(dataset_path)
            data = data_info["data"]

            # Convert to DataFrame
            if isinstance(data, list):
                if len(data) > 0 and isinstance(data[0], list):
                    # 2D data
                    df = pd.DataFrame(data)
                    df.columns = [f'Column_{i+1}' for i in range(len(df.columns))]
                else:
                    # 1D data
                    df = pd.DataFrame({'Value': data})
            else:
                df = pd.DataFrame({'Value': [data]})

            # Add index column and time column if applicable
            df.insert(0, 'Index', range(len(df)))

            # Add metadata as header comments
            metadata_info = [
                f"# Dataset: {dataset_path}",
                f"# File: {self.file_path}",
                f"# Shape: {data_info['metadata']['shape']}",
                f"# Data Type: {data_info['metadata']['dtype']}",
                f"# Size: {data_info['metadata']['size']} elements",
                f"# Exported: {datetime.now().isoformat()}",
                ""
            ]

            if output_path:
                # Write metadata comments first
                with open(output_path, 'w', newline='') as f:
                    for line in metadata_info:
                        f.write(line + '\n')
                    df.to_csv(f, index=False)
                return output_path
            else:
                # Return CSV content as string with metadata
                csv_buffer = io.StringIO()
                for line in metadata_info:
                    csv_buffer.write(line + '\n')
                df.to_csv(csv_buffer, index=False)
                return csv_buffer.getvalue()

        except Exception as e:
            raise Exception(f"Error exporting to CSV: {str(e)}")

    def create_export_file(self, dataset_path: str, format: str, output_dir: Optional[str] = None) -> str:
        """
        Create export file with automatic naming

        Args:
            dataset_path (str): Path to the dataset
            format (str): Export format ('csv' or 'json')
            output_dir (str): Output directory (defaults to Downloads)

        Returns:
            Path to the created file
        """
        try:
            # Create safe filename from dataset path
            safe_name = dataset_path.replace('/', '_').replace('\\', '_').replace(' ', '_')
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"hdf_export_{safe_name}_{timestamp}.{format}"

            # Use Downloads folder if no output directory specified
            if output_dir is None:
                import os
                output_dir = os.path.join(os.path.expanduser('~'), 'Downloads')

            output_path = Path(output_dir) / filename
            output_path.parent.mkdir(parents=True, exist_ok=True)

            if format == 'csv':
                return self.export_to_csv(dataset_path, str(output_path))
            elif format == 'json':
                return self.export_to_json(dataset_path, str(output_path))
            else:
                raise ValueError(f"Unsupported format: {format}")

        except Exception as e:
            raise Exception(f"Error creating export file: {str(e)}")

    def export_to_json(self, dataset_path: str, output_path: Optional[str] = None) -> str:
        """
        Export dataset to JSON format

        Args:
            dataset_path (str): Path to the dataset
            output_path (str): Optional output file path

        Returns:
            Path to the created JSON file or JSON content as string
        """
        try:
            data_info = self.extract_dataset_data(dataset_path)

            # Create comprehensive JSON structure
            export_data = {
                "dataset_info": {
                    "path": dataset_path,
                    "file": str(self.file_path),
                    "extracted_at": datetime.now().isoformat()
                },
                "metadata": data_info["metadata"],
                "summary_statistics": data_info["summary_stats"],
                "data": data_info["data"]
            }

            if output_path:
                with open(output_path, 'w') as f:
                    json.dump(export_data, f, indent=2)
                return output_path
            else:
                return json.dumps(export_data, indent=2)

        except Exception as e:
            raise Exception(f"Error exporting to JSON: {str(e)}")


def main():
    """Command line interface for HDF data extraction"""
    if len(sys.argv) < 3:
        print("Usage: python hdf_data_extractor.py <hdf_file> <command> [dataset_path] [options]")
        print("Commands:")
        print("  extract <dataset_path> - Extract dataset data")
        print("  plot <dataset_path> - Create time series plot")
        print("  hydrograph <dataset_path> - Create hydrograph")
        print("  export_csv <dataset_path> [output_file] - Export to CSV")
        print("  export_json <dataset_path> [output_file] - Export to JSON")
        sys.exit(1)

    file_path = sys.argv[1]
    command = sys.argv[2]

    try:
        extractor = HDFDataExtractor(file_path)

        if command == "extract" and len(sys.argv) >= 4:
            dataset_path = sys.argv[3]
            result = extractor.extract_dataset_data(dataset_path)
            print(json.dumps(result, indent=2))

        elif command == "plot" and len(sys.argv) >= 4:
            dataset_path = sys.argv[3]
            image_base64 = extractor.create_time_series_plot(dataset_path)
            result = {"success": True, "image": image_base64}
            print(json.dumps(result))

        elif command == "hydrograph" and len(sys.argv) >= 4:
            dataset_path = sys.argv[3]
            image_base64 = extractor.create_hydrograph(dataset_path)
            result = {"success": True, "image": image_base64}
            print(json.dumps(result))

        elif command == "export_csv" and len(sys.argv) >= 4:
            dataset_path = sys.argv[3]
            output_file = sys.argv[4] if len(sys.argv) >= 5 else None
            if output_file:
                result_path = extractor.export_to_csv(dataset_path, output_file)
                result = {"success": True, "file_path": result_path}
            else:
                # Create file automatically in Downloads
                result_path = extractor.create_export_file(dataset_path, 'csv')
                result = {"success": True, "file_path": result_path}
            print(json.dumps(result))

        elif command == "export_json" and len(sys.argv) >= 4:
            dataset_path = sys.argv[3]
            output_file = sys.argv[4] if len(sys.argv) >= 5 else None
            if output_file:
                result_path = extractor.export_to_json(dataset_path, output_file)
                result = {"success": True, "file_path": result_path}
            else:
                # Create file automatically in Downloads
                result_path = extractor.create_export_file(dataset_path, 'json')
                result = {"success": True, "file_path": result_path}
            print(json.dumps(result))

        else:
            raise ValueError(f"Unknown command or missing arguments: {command}")

    except Exception as e:
        error_result = {"success": False, "error": str(e)}
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
