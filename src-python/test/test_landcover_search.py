#!/usr/bin/env python3
"""
🔍 Test script for LandCover.hdf file search and Manning extraction
"""

import sys
import os
import json
import h5py
from manning_extractor import ManningExtractor

def explore_hdf_structure(file_path, max_depth=3):
    """Explore HDF5 file structure"""
    print(f"\n📁 Exploring structure of: {os.path.basename(file_path)}")
    print("=" * 60)
    
    try:
        with h5py.File(file_path, 'r') as hf:
            def print_structure(name, obj, depth=0):
                if depth > max_depth:
                    return
                
                indent = "  " * depth
                if isinstance(obj, h5py.Group):
                    print(f"{indent}📂 {name}/")
                    # Print attributes if any
                    if obj.attrs:
                        for attr_name, attr_value in obj.attrs.items():
                            print(f"{indent}   @{attr_name}: {attr_value}")
                elif isinstance(obj, h5py.Dataset):
                    shape_str = f"shape={obj.shape}" if hasattr(obj, 'shape') else ""
                    dtype_str = f"dtype={obj.dtype}" if hasattr(obj, 'dtype') else ""
                    print(f"{indent}📄 {name} ({shape_str}, {dtype_str})")
                    
                    # Check if this might be Manning data
                    if any(keyword in name.lower() for keyword in ['manning', 'roughness', 'landcover', 'land cover']):
                        print(f"{indent}   🌿 POTENTIAL MANNING DATA!")
                        if hasattr(obj, 'shape') and len(obj.shape) > 0:
                            try:
                                sample = obj[:min(10, obj.shape[0])] if obj.shape[0] > 0 else []
                                print(f"{indent}   Sample values: {sample}")
                            except:
                                print(f"{indent}   (Could not read sample)")
            
            hf.visititems(print_structure)
            
    except Exception as e:
        print(f"❌ Error exploring {file_path}: {str(e)}")

def search_landcover_files(hdf_path):
    """Search for LandCover files in the same directory"""
    print(f"\n🔍 Searching for LandCover files near: {hdf_path}")
    print("=" * 60)
    
    hdf_dir = os.path.dirname(hdf_path)
    print(f"Directory: {hdf_dir}")
    
    # List all files in the directory
    try:
        all_files = os.listdir(hdf_dir)
        hdf_files = [f for f in all_files if f.lower().endswith(('.hdf', '.hdf5'))]
        
        print(f"\nAll HDF files in directory:")
        for hdf_file in hdf_files:
            full_path = os.path.join(hdf_dir, hdf_file)
            size = os.path.getsize(full_path)
            print(f"  📄 {hdf_file} ({size:,} bytes)")
            
            # Check if this might be a LandCover file
            if any(keyword in hdf_file.lower() for keyword in ['landcover', 'land', 'cover', 'manning']):
                print(f"    🌿 POTENTIAL LANDCOVER FILE!")
                explore_hdf_structure(full_path, max_depth=2)
        
    except Exception as e:
        print(f"❌ Error listing directory: {str(e)}")

def test_manning_extraction_with_landcover(hdf_path):
    """Test Manning extraction with LandCover search"""
    print(f"\n🧪 Testing Manning extraction with LandCover search")
    print("=" * 60)
    
    try:
        # First explore the main HDF file
        explore_hdf_structure(hdf_path)
        
        # Search for LandCover files
        search_landcover_files(hdf_path)
        
        # Try Manning extraction
        print(f"\n🌿 Attempting Manning extraction...")
        extractor = ManningExtractor(hdf_path)
        result = extractor.extract_manning_values()
        
        print(f"\n📊 Extraction Result:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            manning_data = result.get('manning_data', {})
            total_zones = manning_data.get('total_zones', 0)
            source = result.get('source', 'main HDF')
            
            print(f"\n✅ Success! Found {total_zones} Manning zones from {source}")
            
            if manning_data.get('manning_zones'):
                print(f"\nManning zones preview:")
                for zone_id, zone_info in list(manning_data['manning_zones'].items())[:5]:
                    print(f"  Zone {zone_id}: {zone_info.get('name', 'Unknown')} = {zone_info.get('value', 0):.4f}")
                    
        else:
            print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_landcover_search.py <hdf_file_path>")
        return
    
    hdf_file_path = sys.argv[1]
    
    if not os.path.exists(hdf_file_path):
        print(f"❌ HDF file not found: {hdf_file_path}")
        return
    
    print(f"🔍 LandCover Search Test")
    print(f"Target file: {hdf_file_path}")
    
    test_manning_extraction_with_landcover(hdf_file_path)

if __name__ == "__main__":
    main()
