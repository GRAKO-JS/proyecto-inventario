from django.db import models
from django.db import models
from django.conf import settings
from inventario.models import Producto

class Venta(models.Model):
    MEDIOS_PAGO = [
        ('EFECTIVO', 'Efectivo'),
        ('NEQUI', 'Nequi'),
        ('DAVIPLATA', 'Daviplata'),
        ('TARJETA', 'Tarjeta'),
        ('CREDITO', 'Crédito / Fiado'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    medio_pago = models.CharField(max_length=20, choices=MEDIOS_PAGO, default='EFECTIVO')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
class ResumenMensual(models.Model):
    anio = models.IntegerField()
    mes = models.IntegerField()  # 1 al 12
    total_ventas_monto = models.DecimalField(max_digits=12, decimal_places=2)
    total_transacciones = models.IntegerField()
    total_efectivo = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_nequi_daviplata = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_credito_fiado = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('anio', 'mes')
        verbose_name = "Resumen Mensual"
        verbose_name_plural = "Resúmenes Mensuales"

    def __str__(self):
        return f"Cierre {self.mes}/{self.anio} - Total: ${self.total_ventas_monto}"