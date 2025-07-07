#!/usr/bin/env python3
"""
HECRAS-HDF Integrated Processor for eFlood2
Enhanced HEC-RAS 2D data processing with native pyHMT2D integration
Compatible with HEC-RAS versions 5.0.7 through 6.7+
"""

import sys
import json
import os
import tempfile
import base64
import io
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import numpy as np
    import matplotlib.pyplot as plt
    import matplotlib
    from tabulate import tabulate
    # Use non-interactive backend for server environment
    matplotlib.use('Agg')

    # Import our integrated HECRAS-HDF modules
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    from Hydraulic_Models_Data import RAS_2D
    from Misc import vtkHandler

    HECRAS_HDF_AVAILABLE = True
    logger.info("HECRAS-HDF modules imported successfully")
except (ImportError, AttributeError) as e:
    logger.error(f"HECRAS-HDF modules not available: {e}")
    HECRAS_HDF_AVAILABLE = False
    raise ImportError(f"HECRAS-HDF modules are required but not available: {e}")


def encode_plot_to_base64(fig):
    """Convert matplotlib figure to base64 string"""
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()
    plt.close(fig)
    return image_base64


def extract_manning_values(ras_data):
    """
    Extract Manning's n values from RAS_2D object

    Args:
        ras_data: RAS_2D object with Manning data

    Returns:
        Dict with Manning values and formatted table
    """
    try:
        manning_data = {
            "success": True,
            "manning_zones": {},
            "total_zones": 0,
            "table_data": [],
            "formatted_table": ""
        }

        # Extract Manning zones from RAS_2D object
        if hasattr(ras_data, 'ManningNZones') and ras_data.ManningNZones:
            manning_zones = ras_data.ManningNZones

            # Process Manning zones
            table_rows = []
            for zone_id, zone_data in manning_zones.items():
                if len(zone_data) >= 2:
                    zone_name = zone_data[0]
                    manning_value = zone_data[1]

                    # Decode bytes if necessary
                    if isinstance(zone_name, bytes):
                        zone_name = zone_name.decode('utf-8', errors='ignore')

                    # Skip NoData zones and invalid values
                    if manning_value != -9999.0 and np.isfinite(manning_value) and manning_value > 0:
                        clean_manning_value = float(manning_value)
                        table_rows.append([
                            int(zone_id),
                            str(zone_name),
                            f"{clean_manning_value:.4f}",
                            get_manning_description(clean_manning_value)
                        ])

                        manning_data["manning_zones"][str(zone_id)] = {
                            "name": str(zone_name),
                            "value": clean_manning_value,
                            "description": get_manning_description(clean_manning_value)
                        }

            # Sort by Manning value for better visualization
            table_rows.sort(key=lambda x: float(x[2]))

            # Create formatted table
            headers = ["ID", "Tipo de Cobertura", "Manning n", "Descripción"]
            manning_data["formatted_table"] = tabulate(
                table_rows,
                headers=headers,
                tablefmt="grid",
                stralign="left"
            )

            manning_data["table_data"] = table_rows
            manning_data["total_zones"] = len(table_rows)

            logger.info(f"Extracted {len(table_rows)} Manning zones")

        else:
            manning_data["success"] = False
            manning_data["error"] = "No Manning zones found in RAS data"

    except Exception as e:
        logger.error(f"Error extracting Manning values: {str(e)}")
        manning_data = {
            "success": False,
            "error": str(e),
            "manning_zones": {},
            "total_zones": 0,
            "table_data": [],
            "formatted_table": ""
        }

    return manning_data


def get_manning_description(manning_value):
    """
    Get description for Manning's n value based on typical ranges

    Args:
        manning_value: Manning's n coefficient

    Returns:
        String description of the surface type
    """
    if manning_value < 0.020:
        return "Superficie muy lisa (concreto, asfalto)"
    elif manning_value < 0.030:
        return "Superficie lisa (canales revestidos)"
    elif manning_value < 0.040:
        return "Superficie moderada (suelo natural)"
    elif manning_value < 0.050:
        return "Superficie rugosa (cultivos, pastos)"
    elif manning_value < 0.070:
        return "Superficie muy rugosa (vegetación densa)"
    elif manning_value < 0.100:
        return "Superficie extremadamente rugosa (bosques)"
    else:
        return "Superficie con alta resistencia (urbano denso)"


def get_basic_hdf_metadata(hdf_file):
    """Get basic metadata from HDF file"""
    try:
        import h5py

        with h5py.File(hdf_file, 'r') as hf:
            # Get file version
            file_version = "Unknown"
            if 'File Version' in hf.attrs:
                file_version = hf.attrs['File Version'].decode() if isinstance(hf.attrs['File Version'], bytes) else str(hf.attrs['File Version'])

            # Try to get basic structure info
            metadata = {
                "file_version": file_version,
                "file_size": os.path.getsize(hdf_file),
                "hdf_structure": list(hf.keys()),
                "processor": "HECRAS-HDF Integrated"
            }

            # Try to get comprehensive detailed info
            try:
                # Initialize counters
                total_datasets = 0
                max_time_steps = 0
                max_cells = 0

                # Analyze geometry
                if 'Geometry' in hf and '2D Flow Areas' in hf['Geometry']:
                    flow_areas = list(hf['Geometry']['2D Flow Areas'].keys())
                    metadata["flow_areas"] = flow_areas
                    metadata["num_flow_areas"] = len(flow_areas)

                    if flow_areas:
                        first_area = flow_areas[0]
                        area_path = f"Geometry/2D Flow Areas/{first_area}"
                        if 'Cells Center Coordinate' in hf[area_path]:
                            num_cells = len(hf[f"{area_path}/Cells Center Coordinate"])
                            metadata["num_cells"] = num_cells
                            max_cells = num_cells
                        if 'Faces Center Coordinate' in hf[area_path]:
                            metadata["num_faces"] = len(hf[f"{area_path}/Faces Center Coordinate"])
                else:
                    metadata["flow_areas"] = []
                    metadata["num_flow_areas"] = 0

                # Analyze results and count datasets
                def count_datasets(name, obj):
                    nonlocal total_datasets, max_time_steps, max_cells
                    if isinstance(obj, h5py.Dataset):
                        total_datasets += 1
                        if len(obj.shape) >= 2:
                            time_steps = obj.shape[0]
                            cells = obj.shape[1] if len(obj.shape) > 1 else obj.shape[0]
                            max_time_steps = max(max_time_steps, time_steps)
                            max_cells = max(max_cells, cells)

                hf.visititems(count_datasets)

                # Update metadata with real values
                metadata["total_datasets"] = total_datasets
                metadata["max_time_steps"] = max_time_steps
                metadata["max_cells"] = max_cells

                # Check for results
                if 'Results' in hf and 'Unsteady' in hf['Results']:
                    if 'Output' in hf['Results']['Unsteady']:
                        metadata["has_results"] = True
                        # Try to get time step info from results
                        output_path = 'Results/Unsteady/Output'
                        if 'Output Blocks' in hf[output_path]:
                            blocks = list(hf[f"{output_path}/Output Blocks"].keys())
                            metadata["output_blocks"] = len(blocks)
                    else:
                        metadata["has_results"] = False
                else:
                    metadata["has_results"] = False

            except Exception as detail_error:
                metadata["detail_error"] = str(detail_error)

            return {
                "success": True,
                "metadata": metadata
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error reading HDF file: {str(e)}"
        }


def process_hec_ras_data(hdf_file, terrain_file=None):
    """Process HEC-RAS data using integrated HECRAS-HDF modules - replicating pyHMT2D methodology"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return get_basic_hdf_metadata(hdf_file)

        logger.info(f"Processing HEC-RAS data: {hdf_file}")

        # Replicate pyHMT2D methodology exactly:
        # 1. pyHMT2D REQUIRES a terrain file (even if dummy)
        # 2. pyHMT2D does NOT handle missing datasets gracefully
        # 3. Our version improves on this by handling missing data

        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
            logger.info(f"Using terrain file: {terrain_file}")
        else:
            # pyHMT2D requires terrain file - create dummy path
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)
            logger.info("Using dummy terrain file (pyHMT2D compatibility)")

        # Extract metadata following pyHMT2D structure (JSON serializable)
        metadata = {
            "file_version": str(ras_data.version),
            "units": str(ras_data.units),
            "short_id": str(ras_data.short_ID),
            "start_time": str(ras_data.start_time),
            "end_time": str(ras_data.end_time),
            "flow_areas": [str(area) for area in ras_data.TwoDAreaNames] if hasattr(ras_data, 'TwoDAreaNames') else [],
            "cell_counts": [int(count) for count in ras_data.TwoDAreaCellCounts] if hasattr(ras_data, 'TwoDAreaCellCounts') else [],
            "solution_times": len(ras_data.solution_time) if hasattr(ras_data, 'solution_time') else 0,
            "boundaries": {
                "total": int(ras_data.totalBoundaries) if hasattr(ras_data, 'totalBoundaries') else 0,
                "names": [str(name) for name in ras_data.boundaryNameList] if hasattr(ras_data, 'boundaryNameList') else [],
                "types": [str(type_) for type_ in ras_data.boundaryTypeList] if hasattr(ras_data, 'boundaryTypeList') else []
            },
            "processor": "HECRAS-HDF Integrated (pyHMT2D compatible)",
            "terrain_provided": terrain_file is not None and os.path.exists(terrain_file) if terrain_file else False,
            "datasets_available": {
                "depth_data": len(ras_data.TwoDAreaCellDepth) > 0 if hasattr(ras_data, 'TwoDAreaCellDepth') else False,
                "wse_data": len(ras_data.TwoDAreaCellWSE) > 0 if hasattr(ras_data, 'TwoDAreaCellWSE') else False,
                "velocity_data": len(ras_data.TwoDAreaPointVx) > 0 if hasattr(ras_data, 'TwoDAreaPointVx') else False
            }
        }

        # Extract Manning values
        manning_data = extract_manning_values(ras_data)
        if manning_data["success"]:
            metadata["manning_values"] = manning_data

        return {
            "success": True,
            "metadata": metadata,
            "ras_data_object": "initialized"
        }

    except Exception as e:
        logger.error(f"Error processing HEC-RAS data: {str(e)}")
        return {
            "success": False,
            "error": f"Error processing HEC-RAS data: {str(e)}"
        }


def create_hydrograph(hdf_file, cell_id=0, terrain_file=None):
    """Create hydrograph from boundary conditions using integrated HECRAS-HDF modules"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        logger.info(f"Creating hydrograph from boundary conditions")

        # Use integrated RAS_2D_Data class
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)

        # Create hydrograph plot
        fig, ax = plt.subplots(figsize=(12, 8))

        # Try to extract boundary condition data from HDF5 file directly
        boundary_data_found = False

        try:
            import h5py
            with h5py.File(hdf_file, 'r') as hf:
                logger.info(f"HDF5 file keys: {list(hf.keys())}")

                # Look for boundary condition data in common locations
                boundary_paths = [
                    'Event Conditions/Unsteady/Boundary Conditions',
                    'Boundary Conditions',
                    'Event Conditions/Boundary Conditions',
                    'Unsteady/Boundary Conditions'
                ]

                for bc_path in boundary_paths:
                    if bc_path in hf:
                        bc_group = hf[bc_path]
                        logger.info(f"Found boundary conditions at: {bc_path}")
                        logger.info(f"BC group keys: {list(bc_group.keys())}")

                        # Look for flow or stage data in boundary conditions
                        for bc_name in bc_group.keys():
                            bc_item = bc_group[bc_name]
                            if hasattr(bc_item, 'keys'):  # It's a group
                                for data_key in bc_item.keys():
                                    if 'flow' in data_key.lower() or 'stage' in data_key.lower():
                                        try:
                                            data = bc_item[data_key][:]
                                            if len(data) > 0:
                                                times = range(len(data))
                                                ax.plot(times, data, linewidth=2, label=f'{bc_name} - {data_key}')
                                                boundary_data_found = True
                                                logger.info(f"Plotted data from {bc_name}/{data_key}")
                                        except Exception as e:
                                            logger.warning(f"Error reading {bc_name}/{data_key}: {e}")

                        if boundary_data_found:
                            break

                # If no boundary conditions found, look for any time series data
                if not boundary_data_found:
                    def search_time_series(group, path=""):
                        nonlocal boundary_data_found
                        for key in group.keys():
                            item = group[key]
                            current_path = f"{path}/{key}" if path else key

                            if hasattr(item, 'shape') and len(item.shape) == 1 and item.shape[0] > 1:
                                # This looks like time series data
                                try:
                                    data = item[:]
                                    if len(data) > 1 and not boundary_data_found:
                                        times = range(len(data))
                                        ax.plot(times, data, linewidth=2, label=current_path)
                                        boundary_data_found = True
                                        logger.info(f"Plotted time series from {current_path}")
                                        return
                                except:
                                    pass
                            elif hasattr(item, 'keys'):
                                search_time_series(item, current_path)
                                if boundary_data_found:
                                    return

                    search_time_series(hf)

        except Exception as e:
            logger.warning(f"Error reading HDF5 directly: {e}")

        # Fallback: Use depth data from a representative cell
        if not boundary_data_found:
            if hasattr(ras_data, 'TwoDAreaCellDepth') and len(ras_data.TwoDAreaCellDepth) > 0:
                depths = ras_data.TwoDAreaCellDepth[0]  # First flow area
                if len(depths) > 0 and len(depths[0]) > cell_id:
                    time_series = [depths[t][cell_id] for t in range(len(depths))]
                    times = range(len(time_series))

                    ax.plot(times, time_series, 'b-', linewidth=2, label=f'Depth at Cell {cell_id}')
                    boundary_data_found = True
                    logger.info(f"Using depth data from cell {cell_id} as fallback")

        if boundary_data_found:
            ax.set_xlabel('Time Step')
            ax.set_ylabel('Flow/Stage/Depth')
            ax.set_title(f'Hidrograma - Condiciones de Contorno\nHEC-RAS Version: {getattr(ras_data, "version", "Unknown")}')
            ax.grid(True, alpha=0.3)
            ax.legend()
        else:
            ax.text(0.5, 0.5, 'No se encontraron datos de condiciones de contorno\no datos de series temporales disponibles',
                   transform=ax.transAxes, ha='center', va='center', fontsize=12)
            ax.set_title('Hidrograma - Sin datos disponibles')

        plot_base64 = encode_plot_to_base64(fig)

        return {
            "success": True,
            "plot": plot_base64,
            "data_found": boundary_data_found,
            "units": getattr(ras_data, 'units', 'Unknown'),
            "version": getattr(ras_data, 'version', 'Unknown'),
            "note": "Hidrograma generado desde condiciones de contorno" if boundary_data_found else "No se encontraron datos de condiciones de contorno"
        }

    except Exception as e:
        logger.error(f"Error creating hydrograph: {str(e)}")
        return {
            "success": False,
            "error": f"Error creating hydrograph: {str(e)}"
        }


def create_depth_map(hdf_file, terrain_file=None):
    """Create depth map using integrated HECRAS-HDF modules"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        logger.info("Creating depth map")

        # Use integrated RAS_2D_Data class
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)

        # Create depth map plot
        fig, ax = plt.subplots(figsize=(12, 10))

        if hasattr(ras_data, 'TwoDAreaCellDepth') and len(ras_data.TwoDAreaCellDepth) > 0:
            # Get maximum depths
            depths = ras_data.TwoDAreaCellDepth[0]  # First flow area
            if len(depths) > 0:
                max_depths = np.max(depths, axis=0)
                cell_points = ras_data.TwoDAreaCellPoints[0]  # First flow area

                # Create scatter plot
                scatter = ax.scatter(cell_points[:, 0], cell_points[:, 1],
                                   c=max_depths, cmap='Blues', s=1, alpha=0.7)

                plt.colorbar(scatter, ax=ax, label=f'Max Depth ({ras_data.units})')
                ax.set_xlabel('X Coordinate')
                ax.set_ylabel('Y Coordinate')
                ax.set_title(f'Maximum Depth Map\nHEC-RAS Version: {ras_data.version}')
                ax.set_aspect('equal')
            else:
                ax.text(0.5, 0.5, 'No depth data available', ha='center', va='center', transform=ax.transAxes)
        else:
            ax.text(0.5, 0.5, 'No depth data available', ha='center', va='center', transform=ax.transAxes)

        plot_base64 = encode_plot_to_base64(fig)

        return {
            "success": True,
            "plot": plot_base64,
            "units": ras_data.units,
            "version": ras_data.version
        }

    except Exception as e:
        logger.error(f"Error creating depth map: {str(e)}")
        return {
            "success": False,
            "error": f"Error creating depth map: {str(e)}"
        }


def create_profile(hdf_file, terrain_file=None):
    """Create profile using integrated HECRAS-HDF modules"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        logger.info("Creating profile")

        # Use integrated RAS_2D_Data class
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)

        # Create profile plot
        fig, ax = plt.subplots(figsize=(12, 8))

        if hasattr(ras_data, 'TwoDAreaCellWSE') and len(ras_data.TwoDAreaCellWSE) > 0:
            # Get water surface elevations
            wse = ras_data.TwoDAreaCellWSE[0]  # First flow area
            if len(wse) > 0:
                max_wse = np.max(wse, axis=0)
                cell_points = ras_data.TwoDAreaCellPoints[0]  # First flow area

                # Create a simple profile along X-axis
                sorted_indices = np.argsort(cell_points[:, 0])
                x_coords = cell_points[sorted_indices, 0]
                wse_profile = max_wse[sorted_indices]

                ax.plot(x_coords, wse_profile, 'b-', linewidth=2, label='Water Surface Elevation')
                ax.set_xlabel('X Coordinate')
                ax.set_ylabel(f'WSE ({ras_data.units})')
                ax.set_title(f'Water Surface Profile\nHEC-RAS Version: {ras_data.version}')
                ax.grid(True, alpha=0.3)
                ax.legend()
            else:
                ax.text(0.5, 0.5, 'No WSE data available', ha='center', va='center', transform=ax.transAxes)
        else:
            ax.text(0.5, 0.5, 'No WSE data available', ha='center', va='center', transform=ax.transAxes)

        plot_base64 = encode_plot_to_base64(fig)

        return {
            "success": True,
            "plot": plot_base64,
            "units": ras_data.units,
            "version": ras_data.version
        }

    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        return {
            "success": False,
            "error": f"Error creating profile: {str(e)}"
        }


def get_vtk_export_info(hdf_file, terrain_file=None):
    """Get information about HDF file for VTK export modal"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        # Get basic HDF metadata
        metadata = get_basic_hdf_metadata(hdf_file)

        if not metadata["success"]:
            return metadata

        # Initialize RAS_2D_Data object to get detailed information
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)

        # Extract detailed information
        export_info = {
            "success": True,
            "metadata": {
                "file_version": ras_data.version if hasattr(ras_data, 'version') else "Unknown",
                "units": ras_data.units if hasattr(ras_data, 'units') else "Unknown",
                "flow_areas": [area.decode('utf-8') if isinstance(area, bytes) else str(area) for area in ras_data.TwoDAreaNames] if hasattr(ras_data, 'TwoDAreaNames') else [],
                "cell_counts": ras_data.TwoDAreaCellCounts if hasattr(ras_data, 'TwoDAreaCellCounts') else [],
                "solution_times": len(ras_data.solution_time) if hasattr(ras_data, 'solution_time') else 0,
                "total_timesteps": len(ras_data.solution_time) if hasattr(ras_data, 'solution_time') else 0,
                "start_time": ras_data.start_time if hasattr(ras_data, 'start_time') else "N/A",
                "end_time": ras_data.end_time if hasattr(ras_data, 'end_time') else "N/A",
                "terrain_provided": terrain_file is not None and os.path.exists(terrain_file) if terrain_file else False,
                "processor": "HECRAS-HDF Integrated (pyHMT2D compatible)"
            }
        }

        return export_info

    except Exception as e:
        logger.error(f"Error getting VTK export info: {str(e)}")
        return {
            "success": False,
            "error": f"Error getting VTK export info: {str(e)}"
        }


def export_to_vtk(hdf_file, output_directory, terrain_file=None, export_type="all_timesteps", progress_callback=None):
    """Export to VTK using integrated HECRAS-HDF modules with enhanced options"""
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        logger.info(f"Exporting to VTK: {output_directory}")
        logger.info(f"Export type: {export_type}")

        # Ensure output directory exists
        os.makedirs(output_directory, exist_ok=True)

        # Use integrated RAS_2D_Data class
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
            logger.info(f"Using terrain file: {terrain_file}")
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)
            logger.info("Using dummy terrain file")

        base_name = os.path.splitext(os.path.basename(hdf_file))[0]

        if export_type == "max_values":
            # Export maximum values only
            result = export_max_values_vtk(ras_data, output_directory, base_name, progress_callback)
        else:
            # Export all time steps (default behavior)
            result = export_all_timesteps_vtk(ras_data, output_directory, base_name, progress_callback)

        logger.info("VTK export completed successfully")

        # Add common metadata
        result.update({
            "version": ras_data.version,
            "terrain_used": terrain_file is not None and os.path.exists(terrain_file) if terrain_file else False,
            "export_type": export_type,
            "total_timesteps": len(ras_data.solution_time) if hasattr(ras_data, 'solution_time') else 0
        })

        return result

    except Exception as e:
        logger.error(f"Error exporting to VTK: {str(e)}")
        return {
            "success": False,
            "error": f"Error exporting to VTK: {str(e)}"
        }


def export_all_timesteps_vtk(ras_data, output_directory, base_name, progress_callback=None):
    """Export all time steps to separate VTK files"""
    try:
        # Create subdirectory for all timesteps
        timesteps_dir = os.path.join(output_directory, f"{base_name}_AllTimeSteps")
        os.makedirs(timesteps_dir, exist_ok=True)

        # Export all time steps using native pyHMT2D functionality
        ras_data.saveHEC_RAS2D_results_to_VTK(
            timeStep=-1,  # All time steps
            lastTimeStep=False,
            fileNameBase=base_name,
            dir=timesteps_dir,
            bFlat=False
        )

        # List created files
        vtk_files = []
        if os.path.exists(timesteps_dir):
            vtk_files = [f for f in os.listdir(timesteps_dir) if f.endswith('.vtk')]

        # Create export info file
        export_info = {
            "export_type": "all_timesteps",
            "total_files": len(vtk_files),
            "timesteps": len(ras_data.solution_time) if hasattr(ras_data, 'solution_time') else 0,
            "flow_areas": [str(area) for area in ras_data.TwoDAreaNames] if hasattr(ras_data, 'TwoDAreaNames') else [],
            "units": str(ras_data.units),
            "export_directory": timesteps_dir
        }

        info_file = os.path.join(output_directory, f"{base_name}_export_info.json")
        with open(info_file, 'w') as f:
            json.dump(export_info, f, indent=2)

        return {
            "success": True,
            "output_directory": timesteps_dir,
            "files_created": vtk_files,
            "num_files": len(vtk_files),
            "info_file": info_file
        }

    except Exception as e:
        raise Exception(f"Error in all timesteps export: {str(e)}")


def export_max_values_vtk(ras_data, output_directory, base_name, progress_callback=None):
    """Export maximum values to a single VTK file"""
    try:
        import vtk
        from vtk.util import numpy_support as VN

        logger.info("Calculating maximum values across all time steps...")

        # Calculate maximum values for each flow area
        max_data = calculate_maximum_values(ras_data, progress_callback)

        # Create VTK file for the first flow area (most common case)
        if len(max_data) > 0:
            area_index = 0
            area_name = str(ras_data.TwoDAreaNames[area_index]).replace("b'", "").replace("'", "")

            # Create output filename
            output_file = os.path.join(output_directory, f"{base_name}_{area_name}_MaxValues.vtk")

            # Create VTK unstructured grid
            ugrid = create_vtk_grid_from_ras_data(ras_data, area_index)

            # Add maximum value data arrays
            add_max_data_to_vtk(ugrid, max_data[area_index])

            # Write VTK file
            writer = vtk.vtkUnstructuredGridWriter()
            writer.SetFileName(output_file)
            writer.SetInputData(ugrid)
            writer.Write()

            logger.info(f"Maximum values VTK file created: {output_file}")

            return {
                "success": True,
                "output_directory": output_directory,
                "files_created": [os.path.basename(output_file)],
                "num_files": 1,
                "max_values_file": output_file
            }
        else:
            raise Exception("No flow areas found for maximum values export")

    except Exception as e:
        raise Exception(f"Error in maximum values export: {str(e)}")


def calculate_maximum_values(ras_data, progress_callback=None):
    """Calculate maximum values across all time steps for each flow area"""
    try:
        max_data = []

        for area_index, area_name in enumerate(ras_data.TwoDAreaNames):
            if progress_callback:
                progress_callback(f"Calculating maximum values for {area_name}", area_index, len(ras_data.TwoDAreaNames))

            area_max_data = {}

            # Maximum depth
            if hasattr(ras_data, 'TwoDAreaCellDepth') and len(ras_data.TwoDAreaCellDepth) > area_index:
                depth_data = np.array(ras_data.TwoDAreaCellDepth[area_index])
                if depth_data.size > 0:
                    area_max_data['max_depth'] = np.max(depth_data, axis=0)
                else:
                    area_max_data['max_depth'] = np.zeros(ras_data.TwoDAreaCellCounts[area_index])
            else:
                area_max_data['max_depth'] = np.zeros(ras_data.TwoDAreaCellCounts[area_index])

            # Maximum water surface elevation
            if hasattr(ras_data, 'TwoDAreaCellWSE') and len(ras_data.TwoDAreaCellWSE) > area_index:
                wse_data = np.array(ras_data.TwoDAreaCellWSE[area_index])
                if wse_data.size > 0:
                    area_max_data['max_wse'] = np.max(wse_data, axis=0)
                else:
                    area_max_data['max_wse'] = np.zeros(ras_data.TwoDAreaCellCounts[area_index])
            else:
                area_max_data['max_wse'] = np.zeros(ras_data.TwoDAreaCellCounts[area_index])

            # Maximum velocity magnitude
            if (hasattr(ras_data, 'TwoDAreaPointVx') and len(ras_data.TwoDAreaPointVx) > area_index and
                hasattr(ras_data, 'TwoDAreaPointVy') and len(ras_data.TwoDAreaPointVy) > area_index):

                vx_data = np.array(ras_data.TwoDAreaPointVx[area_index])
                vy_data = np.array(ras_data.TwoDAreaPointVy[area_index])

                if vx_data.size > 0 and vy_data.size > 0:
                    velocity_magnitude = np.sqrt(vx_data**2 + vy_data**2)
                    area_max_data['max_velocity'] = np.max(velocity_magnitude, axis=0)
                    area_max_data['max_vx'] = vx_data[np.argmax(velocity_magnitude, axis=0), np.arange(vx_data.shape[1])]
                    area_max_data['max_vy'] = vy_data[np.argmax(velocity_magnitude, axis=0), np.arange(vy_data.shape[1])]
                else:
                    num_points = len(ras_data.TwoDAreaCellPoints[area_index]) if hasattr(ras_data, 'TwoDAreaCellPoints') else 1000
                    area_max_data['max_velocity'] = np.zeros(num_points)
                    area_max_data['max_vx'] = np.zeros(num_points)
                    area_max_data['max_vy'] = np.zeros(num_points)
            else:
                num_points = len(ras_data.TwoDAreaCellPoints[area_index]) if hasattr(ras_data, 'TwoDAreaCellPoints') else 1000
                area_max_data['max_velocity'] = np.zeros(num_points)
                area_max_data['max_vx'] = np.zeros(num_points)
                area_max_data['max_vy'] = np.zeros(num_points)

            max_data.append(area_max_data)

        return max_data

    except Exception as e:
        raise Exception(f"Error calculating maximum values: {str(e)}")


def create_vtk_grid_from_ras_data(ras_data, area_index):
    """Create VTK unstructured grid from RAS data"""
    try:
        import vtk
        from vtk.util import numpy_support as VN

        # Get geometry data for the specified area
        face_points = ras_data.TwoDAreaFacePointCoordinatesList[area_index]
        cell_face_list = ras_data.TwoDAreaCellFaceList[area_index]

        # Create VTK points
        points = vtk.vtkPoints()
        for point in face_points:
            points.InsertNextPoint(point[0], point[1], point[2])

        # Create VTK unstructured grid
        ugrid = vtk.vtkUnstructuredGrid()
        ugrid.SetPoints(points)

        # Add cells - need to use cell face point indexes, not face list
        # Get cell face point indexes for proper cell construction
        area_name = ras_data.TwoDAreaNames[area_index]
        cell_face_point_indexes = ras_data.get2DAreaCellFacePointsIndexes(area_name)
        cells_face_orientation = ras_data.get2DAreaCellsFaceOrientationInfo(area_name)

        # Add cells using face point indexes
        for cell_i in range(ras_data.TwoDAreaCellCounts[area_index]):
            num_points = cells_face_orientation[cell_i, 1]  # Number of face points
            if num_points >= 3:  # Ensure we have at least a triangle
                cell = vtk.vtkPolygon()
                cell.GetPointIds().SetNumberOfIds(num_points)
                for i in range(num_points):
                    point_id = cell_face_point_indexes[cell_i][i]
                    cell.GetPointIds().SetId(i, point_id)
                ugrid.InsertNextCell(cell.GetCellType(), cell.GetPointIds())

        return ugrid

    except Exception as e:
        raise Exception(f"Error creating VTK grid: {str(e)}")


def add_max_data_to_vtk(ugrid, max_data):
    """Add maximum value data arrays to VTK grid"""
    try:
        from vtk.util import numpy_support as VN

        # Add cell data (depth, WSE)
        cell_data = ugrid.GetCellData()

        # Maximum depth
        if 'max_depth' in max_data:
            depth_array = VN.numpy_to_vtk(max_data['max_depth'])
            depth_array.SetName('Max_Water_Depth_m')
            cell_data.AddArray(depth_array)

        # Maximum water surface elevation
        if 'max_wse' in max_data:
            wse_array = VN.numpy_to_vtk(max_data['max_wse'])
            wse_array.SetName('Max_Water_Surface_m')
            cell_data.AddArray(wse_array)

        # Add point data (velocity)
        point_data = ugrid.GetPointData()

        # Maximum velocity magnitude
        if 'max_velocity' in max_data:
            vel_mag_array = VN.numpy_to_vtk(max_data['max_velocity'])
            vel_mag_array.SetName('Max_Velocity_Magnitude_m_p_s')
            point_data.AddArray(vel_mag_array)

        # Maximum velocity vectors
        if 'max_vx' in max_data and 'max_vy' in max_data:
            # Create 3D velocity vectors (Z component = 0)
            num_points = len(max_data['max_vx'])
            velocity_vectors = np.zeros((num_points, 3))
            velocity_vectors[:, 0] = max_data['max_vx']
            velocity_vectors[:, 1] = max_data['max_vy']
            velocity_vectors[:, 2] = 0.0  # Z component

            vel_vector_array = VN.numpy_to_vtk(velocity_vectors)
            vel_vector_array.SetName('Max_Velocity_Vector_m_p_s')
            vel_vector_array.SetNumberOfComponents(3)
            point_data.AddArray(vel_vector_array)

    except Exception as e:
        raise Exception(f"Error adding data to VTK: {str(e)}")


def extract_manning_table(hdf_file, terrain_file=None):
    """
    Extract Manning values and return formatted table

    Args:
        hdf_file: Path to HDF file
        terrain_file: Optional path to terrain file

    Returns:
        Dict with Manning table data and formatted output
    """
    try:
        if not HECRAS_HDF_AVAILABLE:
            return {"success": False, "error": "HECRAS-HDF modules not available"}

        logger.info("Extracting Manning values table")

        # Initialize RAS_2D object
        if terrain_file and os.path.exists(terrain_file):
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, terrain_file)
        else:
            dummy_terrain = os.path.join(os.path.dirname(hdf_file), "dummy_terrain.tif")
            ras_data = RAS_2D.RAS_2D_Data(hdf_file, dummy_terrain)

        # Extract Manning values
        manning_data = extract_manning_values(ras_data)

        if manning_data["success"]:
            # Print table to console
            print("\n" + "="*80)
            print("🌿 VALORES DE MANNING CALIBRADOS EN EL MODELO HEC-RAS")
            print("="*80)
            print(manning_data["formatted_table"])
            print("="*80)
            print(f"📊 Total de zonas de Manning: {manning_data['total_zones']}")
            print("="*80)

            return {
                "success": True,
                "manning_data": manning_data,
                "table_printed": True
            }
        else:
            return {
                "success": False,
                "error": manning_data.get("error", "No Manning data found")
            }

    except Exception as e:
        logger.error(f"Error extracting Manning table: {str(e)}")
        return {
            "success": False,
            "error": f"Error extracting Manning table: {str(e)}"
        }


def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python hecras_processor.py <operation> <hdf_file> [additional_args...]"
        }))
        sys.exit(1)

    operation = sys.argv[1]
    hdf_file = sys.argv[2]

    # Check if HDF file exists
    if not os.path.exists(hdf_file):
        print(json.dumps({
            "success": False,
            "error": f"HDF file not found: {hdf_file}"
        }))
        sys.exit(1)

    try:
        if operation == "process":
            terrain_file = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
            result = process_hec_ras_data(hdf_file, terrain_file)

        elif operation == "hydrograph":
            cell_id = int(sys.argv[3]) if len(sys.argv) > 3 else 0
            terrain_file = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "null" else None
            result = create_hydrograph(hdf_file, cell_id, terrain_file)

        elif operation == "depth_map":
            terrain_file = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
            result = create_depth_map(hdf_file, terrain_file)

        elif operation == "profile":
            terrain_file = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
            result = create_profile(hdf_file, terrain_file)

        elif operation == "export_vtk":
            output_dir = sys.argv[3] if len(sys.argv) > 3 else tempfile.mkdtemp()
            terrain_file = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "null" else None
            export_type = sys.argv[5] if len(sys.argv) > 5 else "all_timesteps"
            result = export_to_vtk(hdf_file, output_dir, terrain_file, export_type)

        elif operation == "vtk_info":
            terrain_file = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
            result = get_vtk_export_info(hdf_file, terrain_file)

        elif operation == "manning":
            terrain_file = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
            result = extract_manning_table(hdf_file, terrain_file)

        else:
            result = {
                "success": False,
                "error": f"Unknown operation: {operation}"
            }

        print(json.dumps(result))

    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Unexpected error in {operation}: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == "__main__":
    main()
