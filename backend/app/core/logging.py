from __future__ import annotations

import logging
import sys

def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configures structured application logging."""
    logger = logging.getLogger("autoapply")
    if not logger.handlers:
        logger.setLevel(getattr(logging, level.upper(), logging.INFO))
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
        )
        logger.addHandler(handler)
    return logger

logger = setup_logging()
