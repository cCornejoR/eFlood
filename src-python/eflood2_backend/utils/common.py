"""
Common utilities and helper functions for eFlood2 backend
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


# Configure logging
def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """
    Setup logging configuration for eFlood2 backend

    Args:
        level: Logging level (default: INFO)

    Returns:
        Configured logger instance
    """
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    return logging.getLogger(__name__)


def validate_file_path(
    file_path: Union[str, Path], extensions: Optional[List[str]] = None
) -> Path:
    """
    Validate file path and extension

    Args:
        file_path: Path to validate
        extensions: List of allowed extensions (e.g., ['.hdf', '.h5'])

    Returns:
        Validated Path object

    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If extension is not allowed
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if extensions and path.suffix.lower() not in [ext.lower() for ext in extensions]:
        raise ValueError(
            f"Invalid file extension. Expected {extensions}, got: {path.suffix}"
        )

    return path


def safe_float_conversion(value: Any, default: float = 0.0) -> float:
    """
    Safely convert value to float

    Args:
        value: Value to convert
        default: Default value if conversion fails

    Returns:
        Float value or default
    """
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def clean_dataset_name(name: str) -> str:
    """
    Clean dataset name for use in filenames

    Args:
        name: Original dataset name

    Returns:
        Cleaned name suitable for filenames
    """
    return name.replace("/", "_").replace(" ", "_").replace("\\", "_")


def format_error_message(error: Exception, context: str = "") -> str:
    """
    Format error message with context

    Args:
        error: Exception object
        context: Additional context information

    Returns:
        Formatted error message
    """
    if context:
        return f"{context}: {str(error)}"
    return str(error)
