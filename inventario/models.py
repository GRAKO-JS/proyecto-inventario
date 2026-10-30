from django.db import models

class Producto(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.nombre} - ${self.precio} (Stock: {self.stock})"

class Venta(models.Model):
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total de la Venta")
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Venta")

    def __str__(self):
        return f"Venta #{self.id} - ${self.total} ({self.fecha})"

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="detalles_producto")
    cantidad = models.IntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} en Venta #{self.venta.id}"