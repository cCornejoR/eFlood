#!/usr/bin/env python3
"""
🧪 Test script para verificar que el backend del Analyzer+ funcione correctamente
"""

import sys
import json
from pathlib import Path

# Agregar el directorio del backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_manning_extraction(hdf_file_path: str):
    """Test de extracción de valores de Manning"""
    print("🌿 Testing Manning values extraction...")
    
    try:
        from eflood2_backend.integrations.ras_commander_integration import RASCommanderProcessor
        
        processor = RASCommanderProcessor(hdf_file_path, None)
        result = processor.get_manning_values_enhanced()
        
        print(f"Manning result: {json.dumps(result, indent=2)}")
        
        if result.get("success", False):
            data = result.get("data", {})
            zones_found = result.get("zones_found", 0)
            print(f"✅ Manning extraction successful! Found {zones_found} zones")
            return True
        else:
            print(f"❌ Manning extraction failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Manning test failed with exception: {e}")
        return False

def test_mesh_info(hdf_file_path: str):
    """Test de información de malla"""
    print("\n🔷 Testing mesh info extraction...")
    
    try:
        from eflood2_backend.integrations.ras_commander_integration import RASCommanderProcessor
        
        processor = RASCommanderProcessor(hdf_file_path, None)
        result = processor.get_comprehensive_mesh_info()
        
        print(f"Mesh result: {json.dumps(result, indent=2)}")
        
        if result.get("success", False):
            data = result.get("data", {})
            areas_found = result.get("areas_found", 0)
            print(f"✅ Mesh extraction successful! Found {areas_found} areas")
            return True
        else:
            print(f"❌ Mesh extraction failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Mesh test failed with exception: {e}")
        return False

def test_ras_commander_availability():
    """Test de disponibilidad de RAS Commander"""
    print("\n🔧 Testing RAS Commander availability...")

    try:
        from eflood2_backend.integrations.ras_commander.commander_manning import RAS_COMMANDER_AVAILABLE
        from eflood2_backend.integrations.ras_commander.commander_geometry import RAS_COMMANDER_AVAILABLE as GEOM_AVAILABLE

        print(f"RAS Commander Manning: {'✅ Available' if RAS_COMMANDER_AVAILABLE else '❌ Not available'}")
        print(f"RAS Commander Geometry: {'✅ Available' if GEOM_AVAILABLE else '❌ Not available'}")

        return RAS_COMMANDER_AVAILABLE and GEOM_AVAILABLE

    except Exception as e:
        print(f"❌ RAS Commander test failed: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("🧪 Testing Analyzer+ backend modules")
    print("=" * 60)

    # Test RAS Commander availability first
    ras_available = test_ras_commander_availability()

    if not ras_available:
        print("\n⚠️ RAS Commander not available. Install with: uv add ras-commander")
        print("Testing will continue with mock data...")

    # Use the test HDF file we created
    hdf_file_path = "test_hecras_model.hdf"

    print(f"\n🧪 Testing backend modules with test file: {hdf_file_path}")
    print("=" * 60)

    # Test Manning extraction
    manning_success = test_manning_extraction(hdf_file_path)

    # Test mesh info
    mesh_success = test_mesh_info(hdf_file_path)

    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"RAS Commander availability: {'✅ PASS' if ras_available else '⚠️ NOT INSTALLED'}")
    print(f"Manning extraction: {'✅ PASS' if manning_success else '❌ FAIL'}")
    print(f"Mesh extraction: {'✅ PASS' if mesh_success else '❌ FAIL'}")

    if manning_success and mesh_success:
        print("\n🎉 Backend modules are working correctly!")
        if not ras_available:
            print("💡 Install RAS Commander for full functionality: uv add ras-commander")
        sys.exit(0)
    else:
        print("\n⚠️ Some backend modules failed. Check the output above for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
