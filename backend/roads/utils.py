def quick_sort(arr, key_func, reverse=False):
    """In-place QuickSort implementation with custom key function"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    if reverse:
        left = [x for x in arr if key_func(x) > key_func(pivot)]
        middle = [x for x in arr if key_func(x) == key_func(pivot)]
        right = [x for x in arr if key_func(x) < key_func(pivot)]
    else:
        left = [x for x in arr if key_func(x) < key_func(pivot)]
        middle = [x for x in arr if key_func(x) == key_func(pivot)]
        right = [x for x in arr if key_func(x) > key_func(pivot)]
    
    return quick_sort(left, key_func, reverse) + middle + quick_sort(right, key_func, reverse)

def binary_search(arr, x, key_func):
    """Binary search with custom key function"""
    low = 0
    high = len(arr) - 1
    mid = 0
    
    while low <= high:
        mid = (high + low) // 2
        mid_val = key_func(arr[mid])
        
        if mid_val < x:
            low = mid + 1
        elif mid_val > x:
            high = mid - 1
        else:
            return arr[mid]
    return None

def sort_and_search_roads(roads, sort_by='name', search_query=None, reverse=False):
    """Sort roads using QuickSort and search using Binary Search"""
    # Sort roads
    key_func = lambda road: getattr(road, sort_by).lower() if isinstance(getattr(road, sort_by), str) else getattr(road, sort_by)
    sorted_roads = quick_sort(roads, key_func, reverse)
    
    # Search if query provided
    if search_query:
        if sort_by in ['name', 'status']:
            # For string fields, use partial matching
            return [road for road in sorted_roads if search_query.lower() in getattr(road, sort_by).lower()]
        else:
            # For numeric fields, use exact match
            return binary_search(sorted_roads, search_query, key_func)
    
    return sorted_roads

def calculate_road_stats(roads):
    """Calculate statistics based on road data"""
    stats = {
        'total_roads': len(roads),
        'completed_roads': 0,
        'in_progress_roads': 0,
        'planned_roads': 0,
        'budget_allocated': 0,
        'budget_spent': 0
    }
    
    for road in roads:
        stats['budget_allocated'] += road.budget
        stats['budget_spent'] += road.budget * (road.progress / 100)
        
        if road.status == 'completed':
            stats['completed_roads'] += 1
        elif road.status == 'ongoing':
            stats['in_progress_roads'] += 1
        elif road.status == 'planned':
            stats['planned_roads'] += 1
    
    return stats

def format_currency(amount):
    """Format value as currency for Kenya"""
    return f"KES {amount:,.2f}"

def format_date(date_obj):
    """Format date for display"""
    return date_obj.strftime('%b %d, %Y')