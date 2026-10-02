from datetime import datetime, timezone

def utc_now() -> datetime:
    """
    Returns the current naive UTC datetime without emitting Python 3.12 DeprecationWarning.
    Provides 100% backward compatibility with existing SQLite and PostgreSQL database records.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)
