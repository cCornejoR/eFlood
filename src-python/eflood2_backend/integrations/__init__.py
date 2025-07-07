"""
External Integrations Module
Handles integration with external libraries and tools
"""

# Try to import HECRAS-HDF integration - disabled due to numpy compatibility issues
HECRAS_HDF_AVAILABLE = False
__all__ = []

# try:
#     from . import hecras_hdf
#     HECRAS_HDF_AVAILABLE = True
#     __all__ = ["hecras_hdf"]
# except ImportError:
#     HECRAS_HDF_AVAILABLE = False
#     __all__ = []
