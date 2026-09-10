from django.shortcuts import render
from django.shortcuts import render
from django.http import JsonResponse
from inventario.models import Producto
from .models import Venta, DetalleVenta
from django.db import transaction
import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required(login_url='/accounts/login/')
def pos_view(request):
    return render(request, 'pos.html')

def pos_view(request):
    return render(request, 'base.html')

def buscar_producto(request):
    """API rápida para el lector de código de barras o búsqueda predictiva"""
    query = request.GET.get('q', '')
    productos = Producto.objects.filter(
        codigo_barras__icontains=query
    ) | Producto.objects.filter(
        nombre__icontains=query
    )
    
    data = []
    for p in productos[:10]:  # Limitar a 10 resultados para velocidad
        data.append({
            'id': p.id,
            'codigo': p.codigo_barras,
            'nombre': p.nombre,
            'precio': float(p.precio_venta),
            'stock': p.stock
        })
    return JsonResponse({'productos': data})

@transaction.atomic
def procesar_venta(request):
    """Guarda la venta y genera los detalles de forma atómica"""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            items = body.get('items', [])
            medio_pago = body.get('medio_pago', 'EFECTIVO')
            
            if not items:
                return JsonResponse({'success': False, 'error': 'El carrito está vacío'}, status=400)

            total_venta = sum(item['precio'] * item['cantidad'] for item in items)

            # Crear cabecera de la venta
            venta = Venta.objects.create(
                usuario=request.user,
                medio_pago=medio_pago,
                total=total_venta
            )

            # Crear detalles (esto dispara los Signals para descontar stock)
            for item in items:
                producto = Producto.objects.get(id=item['id'])
                if producto.stock < item['cantidad']:
                    raise Exception(f"Stock insuficiente para {producto.nombre}")

                DetalleVenta.objects.create(
                    venta=venta,
                    producto=producto,
                    cantidad=item['cantidad'],
                    precio_unitario=item['precio'],
                    subtotal=item['precio'] * item['cantidad']
                )

            return JsonResponse({'success': True, 'venta_id': venta.id})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
