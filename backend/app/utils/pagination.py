"""
Pagination Utilities for FalcoElectrec API
"""
from flask import request


def get_pagination_params():
    """
    Extract pagination parameters from query string.
    Returns (page, per_page) with defaults.
    """
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
    except ValueError:
        page = 1
        per_page = 20
    
    # Enforce limits
    page = max(1, page)
    per_page = min(max(1, per_page), 100)  # Max 100 per page
    
    return page, per_page


def paginate_query(query, page=1, per_page=20, serialize_fn=None):
    """
    Paginate a SQLAlchemy query and return formatted response.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        per_page: Items per page
        serialize_fn: Optional function to serialize each item
    
    Returns:
        dict with items and pagination metadata
    """
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    items = pagination.items
    if serialize_fn:
        items = [serialize_fn(item) for item in items]
    
    return {
        'items': items,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }


def paginated_response(query, serialize_fn=None, item_key='items'):
    """
    Create a paginated response from a query.
    
    Args:
        query: SQLAlchemy query object
        serialize_fn: Function to serialize each item (defaults to to_dict)
        item_key: Key name for the items in response
    
    Returns:
        dict with items and pagination info
    """
    page, per_page = get_pagination_params()
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    items = pagination.items
    if serialize_fn:
        items = [serialize_fn(item) for item in items]
    elif hasattr(items[0] if items else None, 'to_dict'):
        items = [item.to_dict() for item in items]
    
    return {
        item_key: items,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }
