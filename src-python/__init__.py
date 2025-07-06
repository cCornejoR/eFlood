"""
eFlood2 Backend Python Package
Hydraulic analysis tools for HEC-RAS 2D models with integrated pyHMT2D
"""

from .export_tools import ExportTools
from .geometry_tools import GeometryTools
from .hdf_reader import HDFReader
from .hydraulic_calc import HydraulicCalculator
from .raster_converter import RasterConverter
from .section_tools import SectionTools

# Import HECRAS-HDF integrated modules
try:
    from . import HECRAS_HDF
    HECRAS_HDF_AVAILABLE = True
except ImportError:
    HECRAS_HDF_AVAILABLE = False

__version__ = "0.1.0"
__author__ = "eFlood2 Team"

__all__ = [
    "HDFReader",
    "RasterConverter",
    "GeometryTools",
    "SectionTools",
    "HydraulicCalculator",
    "ExportTools",
]

if HECRAS_HDF_AVAILABLE:
    __all__.append("HECRAS_HDF")
