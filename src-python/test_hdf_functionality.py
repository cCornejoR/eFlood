"""
Test script for HDF functionality
Creates sample HDF5 data and tests all implemented functions
"""

import h5py
import numpy as np
import json
import tempfile
import os
from pathlib import Path

def create_sample_hdf_file():
    """Create a sample HDF5 file with HEC-RAS-like structure"""

    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.hdf5')
    temp_file.close()

    with h5py.File(temp_file.name, 'w') as f:
        # Create HEC-RAS-like structure
        results_group = f.create_group('Results')
        unsteady_group = results_group.create_group('Unsteady')
        output_group = unsteady_group.create_group('Output')
        blocks_group = output_group.create_group('Output Blocks')
        base_group = blocks_group.create_group('Base Output')
        time_series_group = base_group.create_group('Unsteady Time Series')
        flow_areas_group = time_series_group.create_group('2D Flow Areas')
        area_group = flow_areas_group.create_group('2D Area 1')

        # Create sample time series data (100 time steps)
        n_timesteps = 100
        time_hours = np.linspace(0, 24, n_timesteps)  # 24 hours simulation

        # Water Surface Elevation (sinusoidal pattern with trend)
        base_elevation = 100.0
        seasonal_variation = 2.0 * np.sin(2 * np.pi * time_hours / 24)
        flood_peak = 3.0 * np.exp(-((time_hours - 12)**2) / 8)  # Peak at hour 12
        water_surface = base_elevation + seasonal_variation + flood_peak + np.random.normal(0, 0.1, n_timesteps)

        # Face Velocity (related to water surface changes)
        velocity = np.abs(np.gradient(water_surface)) * 10 + np.random.normal(0.5, 0.2, n_timesteps)
        velocity = np.clip(velocity, 0, 5)  # Realistic velocity range

        # Water Depth (assuming constant bottom elevation)
        bottom_elevation = 95.0
        depth = water_surface - bottom_elevation

        # Create datasets
        ws_dataset = area_group.create_dataset('Water Surface', data=water_surface)
        ws_dataset.attrs['units'] = 'meters'
        ws_dataset.attrs['description'] = 'Water surface elevation'

        vel_dataset = area_group.create_dataset('Face Velocity', data=velocity)
        vel_dataset.attrs['units'] = 'm/s'
        vel_dataset.attrs['description'] = 'Face normal velocity'

        depth_dataset = area_group.create_dataset('Depth', data=depth)
        depth_dataset.attrs['units'] = 'meters'
        depth_dataset.attrs['description'] = 'Water depth'

        # Time dataset
        time_dataset = area_group.create_dataset('Time', data=time_hours)
        time_dataset.attrs['units'] = 'hours'
        time_dataset.attrs['description'] = 'Simulation time'

        # Summary data
        summary_group = base_group.create_group('Summary Output')
        summary_group.create_dataset('Maximum Water Surface', data=np.max(water_surface))
        summary_group.create_dataset('Minimum Water Surface', data=np.min(water_surface))
        summary_group.create_dataset('Maximum Face Velocity', data=np.max(velocity))
        summary_group.create_dataset('Minimum Face Velocity', data=np.min(velocity))

        # Add some metadata
        f.attrs['title'] = 'Sample HEC-RAS 2D Model Output'
        f.attrs['created'] = 'Test script'
        f.attrs['version'] = '1.0'

    return temp_file.name

def test_hdf_data_extractor():
    """Test the HDF data extractor functionality"""
    print("🧪 Testing HDF Data Extractor...")

    # Create sample file
    hdf_file = create_sample_hdf_file()
    print(f"✅ Created sample HDF file: {hdf_file}")

    try:
        from hdf_data_extractor import HDFDataExtractor

        extractor = HDFDataExtractor(hdf_file)

        # Test dataset paths
        test_datasets = [
            'Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/2D Area 1/Water Surface',
            'Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/2D Area 1/Face Velocity',
            'Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/2D Area 1/Depth'
        ]

        for dataset_path in test_datasets:
            print(f"\n📊 Testing dataset: {dataset_path.split('/')[-1]}")

            # Test data extraction
            try:
                data_info = extractor.extract_dataset_data(dataset_path)
                print(f"  ✅ Data extraction: {len(data_info['data'])} points")
                print(f"  📈 Stats: min={data_info['summary_stats']['min']:.2f}, max={data_info['summary_stats']['max']:.2f}")
            except Exception as e:
                print(f"  ❌ Data extraction failed: {e}")

            # Test plot creation
            try:
                plot_base64 = extractor.create_time_series_plot(dataset_path)
                print(f"  ✅ Time series plot: {len(plot_base64)} chars")
            except Exception as e:
                print(f"  ❌ Plot creation failed: {e}")

            # Test hydrograph creation
            try:
                hydro_base64 = extractor.create_hydrograph(dataset_path)
                print(f"  ✅ Hydrograph: {len(hydro_base64)} chars")
            except Exception as e:
                print(f"  ❌ Hydrograph creation failed: {e}")

            # Test CSV export
            try:
                csv_content = extractor.export_to_csv(dataset_path)
                print(f"  ✅ CSV export: {len(csv_content)} chars")
            except Exception as e:
                print(f"  ❌ CSV export failed: {e}")

            # Test JSON export
            try:
                json_content = extractor.export_to_json(dataset_path)
                print(f"  ✅ JSON export: {len(json_content)} chars")
            except Exception as e:
                print(f"  ❌ JSON export failed: {e}")

    finally:
        # Clean up
        os.unlink(hdf_file)
        print(f"\n🧹 Cleaned up temporary file")

def test_hydraulic_plots():
    """Test hydraulic plotting functionality"""
    print("\n🎨 Testing Hydraulic Plots...")

    try:
        from hydraulic_plots import HydraulicPlotter

        plotter = HydraulicPlotter()

        # Create sample data
        n_points = 100
        time_hours = np.linspace(0, 24, n_points)

        # Water surface data
        water_surface = 100 + 2 * np.sin(2 * np.pi * time_hours / 24) + np.random.normal(0, 0.1, n_points)

        # Velocity data
        velocity = 1 + 0.5 * np.sin(2 * np.pi * time_hours / 12) + np.random.normal(0, 0.1, n_points)
        velocity = np.clip(velocity, 0, 3)

        # Depth data
        depth = 5 + np.sin(2 * np.pi * time_hours / 24) + np.random.normal(0, 0.1, n_points)
        depth = np.clip(depth, 0.1, 10)

        # Test different plot types
        plot_tests = [
            ('Water Surface Plot', lambda: plotter.create_water_surface_plot(water_surface, time_hours)),
            ('Velocity Plot', lambda: plotter.create_velocity_plot(velocity, time_hours)),
            ('Depth Plot', lambda: plotter.create_depth_plot(depth, time_hours)),
            ('Advanced Hydrograph', lambda: plotter.create_hydrograph_advanced(velocity * 10, time_hours, water_surface)),
            ('Flow Duration Curve', lambda: plotter.create_flow_duration_curve(velocity * 10))
        ]

        for plot_name, plot_func in plot_tests:
            try:
                plot_base64 = plot_func()
                print(f"  ✅ {plot_name}: {len(plot_base64)} chars")
            except Exception as e:
                print(f"  ❌ {plot_name} failed: {e}")

    except ImportError as e:
        print(f"❌ Could not import hydraulic_plots: {e}")

def test_command_line_interface():
    """Test command line interfaces"""
    print("\n💻 Testing Command Line Interfaces...")

    # Create sample file
    hdf_file = create_sample_hdf_file()
    dataset_path = 'Results/Unsteady/Output/Output Blocks/Base Output/Unsteady Time Series/2D Flow Areas/2D Area 1/Water Surface'

    try:
        import subprocess
        import sys

        # Test hdf_data_extractor CLI
        cmd = [sys.executable, 'hdf_data_extractor.py', hdf_file, 'extract', dataset_path]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                print("  ✅ HDF Data Extractor CLI: Success")
            else:
                print(f"  ❌ HDF Data Extractor CLI failed: {result.stderr}")
        except subprocess.TimeoutExpired:
            print("  ⏰ HDF Data Extractor CLI: Timeout")
        except Exception as e:
            print(f"  ❌ HDF Data Extractor CLI error: {e}")

    finally:
        os.unlink(hdf_file)

def main():
    """Run all tests"""
    print("🚀 Starting HDF Functionality Tests")
    print("=" * 50)

    test_hdf_data_extractor()
    test_hydraulic_plots()
    test_command_line_interface()

    print("\n" + "=" * 50)
    print("✨ Tests completed!")

if __name__ == "__main__":
    main()
