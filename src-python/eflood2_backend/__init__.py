"""
eFlood2 Backend Python Package
Hydraulic analysis tools for HEC-RAS 2D models with integrated pyHMT2D

This package provides a comprehensive suite of tools for hydraulic analysis,
organized by functionality for better maintainability and usability.
"""

# Import main classes for backward compatibility
from .readers.hdf_reader import HDFReader
from .processors.geometry_processor import GeometryProcessor as GeometryTools
from .processors.section_processor import SectionProcessor as SectionTools
from .exporters.data_exporter import DataExporter as ExportTools
from .exporters.raster_exporter import RasterExporter as RasterConverter

# Import new modules with proper names
from .readers import (
    HDFReader,
    BoundaryReader,
    DataExtractor,
    ManningReader,
)

from .processors import (
    HydraulicCalculator,
    HydraulicPlotter,
    GeometryProcessor,
    SectionProcessor,
)

from .exporters import (
    DataExporter,
    RasterExporter,
    HydrographExporter,
)

# HECRAS-HDF integration available but not auto-imported to avoid numpy compatibility issues
# Can be imported manually: from eflood2_backend.integrations import hecras_hdf
HECRAS_HDF_AVAILABLE = True

__version__ = "0.1.0"
__author__ = "eFlood2 Team"

# Public API - maintain backward compatibility
__all__ = [
    # Legacy names for backward compatibility
    "HDFReader",
    "GeometryTools",
    "SectionTools", 
    "ExportTools",
    "RasterConverter",
    
    # New organized names
    "BoundaryReader",
    "DataExtractor", 
    "ManningReader",
    "HydraulicCalculator",
    "HydraulicPlotter",
    "GeometryProcessor",
    "SectionProcessor",
    "DataExporter",
    "RasterExporter",
    "HydrographExporter",
]

if HECRAS_HDF_AVAILABLE:
    __all__.append("hecras_hdf")
