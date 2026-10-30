from django.db import models

class Tienda(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"

class InventarioTienda(models.Model):
    tienda = models.ForeignKey(Tienda, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    stock = models.IntegerField(default=0)

    class Meta:
        unique_together = ('tienda', 'producto')

    def __str__(self):
        return f"{self.producto.nombre} en {self.tienda.nombre}: {self.stock} unidades"
    
def api_buscar_productos(request):
    # Aquí usas el modelo Producto de models.py
    productos = Producto.objects.filter(stock__gt=0).values('id', 'nombre', 'precio', 'stock')
    return JsonResponse({'success': True, 'productos': list(productos)})