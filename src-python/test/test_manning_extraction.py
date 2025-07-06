#!/usr/bin/env python3
"""
🧪 Test script for Manning values extraction
"""

import sys
import os
import json
from manning_extractor import ManningExtractor

def test_manning_extraction():
    """Test Manning extraction with debug information"""
    
    # Check if HDF file path is provided
    if len(sys.argv) < 2:
        print("Usage: python test_manning_extraction.py <hdf_file_path>")
        return
    
    hdf_file_path = sys.argv[1]
    
    if not os.path.exists(hdf_file_path):
        print(f"❌ HDF file not found: {hdf_file_path}")
        return
    
    print(f"🔍 Testing Manning extraction from: {hdf_file_path}")
    print("=" * 60)
    
    try:
        # Create extractor
        extractor = ManningExtractor(hdf_file_path)
        
        # Extract Manning values
        result = extractor.extract_manning_values()
        
        print("📊 Extraction Result:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            manning_data = result.get('manning_data', {})
            total_zones = manning_data.get('total_zones', 0)
            manning_zones = manning_data.get('manning_zones', {})
            
            print(f"\n✅ Success! Found {total_zones} Manning zones:")
            
            for zone_id, zone_info in manning_zones.items():
                print(f"  Zone {zone_id}: {zone_info['name']} = {zone_info['value']:.4f}")
                
        else:
            print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_manning_extraction()
