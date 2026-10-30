@csrf_exempt
def api_buscar_productos(request):
    # Aquí puedes filtrar productos que tengan stock > 0
    productos = Producto.objects.filter(stock__gt=0).values('id', 'nombre', 'precio', 'stock')
    return JsonResponse({'success': True, 'productos': list(productos)})