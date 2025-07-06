"""
HDF File Reader Module for HEC-RAS 2D Models
Handles reading, parsing, and extracting metadata from HDF files
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

import h5py
import numpy as np


class HDFReader:
    """Class for reading and analyzing HDF files from HEC-RAS 2D models"""

    def __init__(self, file_path: str):
        """
        Initialize HDF reader with file path

        Args:
            file_path (str): Path to the HDF file
        """
        self.file_path = Path(file_path)
        self.file_info = {}
        self.structure = {}

        # Validate file exists
        if not self.file_path.exists():
            raise FileNotFoundError(f"HDF file not found: {file_path}")

        # Validate file extension
        if self.file_path.suffix.lower() not in ['.hdf', '.h5', '.hdf5']:
            raise ValueError(f"Invalid file type. Expected .hdf, .h5, or .hdf5, got: {self.file_path.suffix}")

    def get_file_info(self) -> Dict[str, Any]:
        """
        Get basic file information including size, modification date, etc.

        Returns:
            Dict containing file metadata
        """
        if not self.file_path.exists():
            raise FileNotFoundError(f"HDF file not found: {self.file_path}")

        stat = self.file_path.stat()
        self.file_info = {
            "name": self.file_path.name,
            "path": str(self.file_path),
            "size_bytes": stat.st_size,
            "size_mb": round(stat.st_size / (1024 * 1024), 2),
            "modified": stat.st_mtime,
            "created": stat.st_ctime,
        }
        return self.file_info

    def get_file_structure(self) -> Dict[str, Any]:
        """
        Get the hierarchical structure of the HDF file

        Returns:
            Dict representing the file structure with full hierarchy
        """
        structure = {}

        try:
            with h5py.File(self.file_path, "r") as f:

                def visit_func(name, obj):
                    # Store the full path information for each item
                    if isinstance(obj, h5py.Group):
                        structure[name] = {
                            "type": "group",
                            "attrs": dict(obj.attrs),
                        }
                    elif isinstance(obj, h5py.Dataset):
                        structure[name] = {
                            "type": "dataset",
                            "shape": obj.shape,
                            "dtype": str(obj.dtype),
                            "size": obj.size,
                            "attrs": dict(obj.attrs),
                        }

                # Visit all items in the HDF file
                f.visititems(visit_func)

        except Exception as e:
            raise Exception(f"Error reading HDF file structure: {str(e)}")

        self.structure = structure
        return structure

    def get_dataset_data(self, dataset_path: str) -> np.ndarray:
        """
        Extract data from a specific dataset

        Args:
            dataset_path (str): Path to the dataset within the HDF file

        Returns:
            numpy array containing the dataset data
        """
        try:
            with h5py.File(self.file_path, "r") as f:
                if dataset_path not in f:
                    raise KeyError(f"Dataset not found: {dataset_path}")

                dataset = f[dataset_path]
                return dataset[:]

        except Exception as e:
            raise Exception(f"Error reading dataset {dataset_path}: {str(e)}")

    def find_hydraulic_results(self) -> Dict[str, List[str]]:
        """
        Find common hydraulic result datasets (depth, velocity, etc.)

        Returns:
            Dict with categories of hydraulic results
        """
        hydraulic_datasets = {
            "depth": [],
            "velocity": [],
            "water_surface": [],
            "flow_rate": [],
            "other": [],
        }

        if not self.structure:
            self.get_file_structure()

        for path, info in self.structure.items():
            if info["type"] == "dataset":
                path_lower = path.lower()
                if "depth" in path_lower or "water depth" in path_lower:
                    hydraulic_datasets["depth"].append(path)
                elif "velocity" in path_lower or "vel" in path_lower:
                    hydraulic_datasets["velocity"].append(path)
                elif "water surface" in path_lower or "wse" in path_lower:
                    hydraulic_datasets["water_surface"].append(path)
                elif "flow" in path_lower or "discharge" in path_lower:
                    hydraulic_datasets["flow_rate"].append(path)
                else:
                    hydraulic_datasets["other"].append(path)

        return hydraulic_datasets

    def get_detailed_metadata(self) -> Dict[str, Any]:
        """
        Extract detailed metadata including dimensions, time steps, and cell counts

        Returns:
            Dict with detailed metadata
        """
        metadata = {
            "total_datasets": 0,
            "time_steps": 0,
            "cell_count": 0,
            "flow_areas": 0,
            "variables": {
                "depth": {"count": 0, "max_shape": []},
                "velocity": {"count": 0, "max_shape": []},
                "wse": {"count": 0, "max_shape": []},
            }
        }

        try:
            with h5py.File(self.file_path, "r") as f:
                def analyze_dataset(name, obj):
                    if isinstance(obj, h5py.Dataset):
                        metadata["total_datasets"] += 1
                        shape = obj.shape
                        name_lower = name.lower()

                        # Extraer dimensiones máximas
                        if len(shape) >= 2:
                            time_steps = shape[0]
                            cells = shape[1]
                            metadata["time_steps"] = max(metadata["time_steps"], time_steps)
                            metadata["cell_count"] = max(metadata["cell_count"], cells)

                        # Contar áreas de flujo
                        if "2d flow area" in name_lower:
                            metadata["flow_areas"] += 1

                        # Categorizar variables
                        if "depth" in name_lower:
                            metadata["variables"]["depth"]["count"] += 1
                            if len(shape) > len(metadata["variables"]["depth"]["max_shape"]):
                                metadata["variables"]["depth"]["max_shape"] = list(shape)
                        elif "velocity" in name_lower:
                            metadata["variables"]["velocity"]["count"] += 1
                            if len(shape) > len(metadata["variables"]["velocity"]["max_shape"]):
                                metadata["variables"]["velocity"]["max_shape"] = list(shape)
                        elif "wse" in name_lower or "water surface" in name_lower:
                            metadata["variables"]["wse"]["count"] += 1
                            if len(shape) > len(metadata["variables"]["wse"]["max_shape"]):
                                metadata["variables"]["wse"]["max_shape"] = list(shape)

                f.visititems(analyze_dataset)

                # Asegurar valores mínimos
                if metadata["flow_areas"] == 0:
                    metadata["flow_areas"] = 1

        except Exception as e:
            print(f"Error extracting detailed metadata: {str(e)}")

        return metadata

    def export_structure_to_json(self, output_path: str) -> None:
        """
        Export file structure to JSON file

        Args:
            output_path (str): Path for the output JSON file
        """
        if not self.structure:
            self.get_file_structure()

        export_data = {
            "file_info": self.file_info,
            "structure": self.structure,
            "hydraulic_results": self.find_hydraulic_results(),
        }

        with open(output_path, "w") as f:
            json.dump(export_data, f, indent=2, default=str)


def main():
    """Command line interface for HDF reader"""
    if len(sys.argv) < 2:
        print("Usage: python hdf_reader.py <hdf_file_path> [command]")
        print("Commands: structure, info, hydraulic")
        sys.exit(1)

    file_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "structure"

    try:
        reader = HDFReader(file_path)

        if command == "info":
            info = reader.get_file_info()
            print(json.dumps(info, indent=2, default=str))
        elif command == "structure":
            structure = reader.get_file_structure()
            print(json.dumps(structure, indent=2, default=str))
        elif command == "hydraulic":
            hydraulic = reader.find_hydraulic_results()
            print(json.dumps(hydraulic, indent=2))
        elif command == "metadata":
            metadata = reader.get_detailed_metadata()
            print(json.dumps(metadata, indent=2, default=str))
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
