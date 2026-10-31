from django.db import connection  # <-- Importa connection arriba
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache  # <--- ¡Esta línea es la que faltaba!
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.db.models import F, Sum, DecimalField
from .models import Producto, InventarioTienda

# Función API adaptada para consultar a través de InventarioTienda
def api_buscar_productos(request):
    # Buscamos en el inventario filtrando los que tengan stock mayor a 0
    inventario_items = InventarioTienda.objects.filter(stock__gt=0).select_related('producto', 'tienda')
    
    productos_lista = [{
        'id': item.id,
        'codigo': item.producto.codigo,
        'nombre': item.producto.nombre,
        'precio': float(item.producto.precio),
        'stock': item.stock,
        'tienda': item.tienda.nombre
    } for item in inventario_items]
    
    return JsonResponse({'success': True, 'productos': productos_lista})
@never_cache
@login_required
def inventario_view(request):
    """
    Vista de diagnóstico para verificar la base de datos activa.
    """
    # Esto imprimirá en tu terminal de VS Code los datos de la BD que Django está usando en este instante
    print("--- BASE DE DATOS ACTIVA ---")
    print("Vendor:", connection.vendor)
    print("Name:", connection.settings_dict['NAME'])
    print("Host:", connection.settings_dict['HOST'])
    print("----------------------------")

    inventario_items = InventarioTienda.objects.select_related('producto', 'tienda').all()
    
    total_productos = inventario_items.count()
    stock_bajo = inventario_items.filter(stock__lte=5).count()
    
    valor_total = inventario_items.annotate(
        subtotal=F('stock') * F('producto__precio')
    ).aggregate(
        total=Sum('subtotal', output_field=DecimalField())
    )['total'] or 0

    context = {
        'inventario_items': inventario_items,
        'total_productos': total_productos,
        'stock_bajo': stock_bajo,
        'valor_total': valor_total,
    }
    
    return render(request, 'inventario.html', context)