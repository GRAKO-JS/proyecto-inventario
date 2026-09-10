from django.db import models
from django.db import models
from django.conf import settings
import urllib.parse

class Cliente(models.Model):
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20, help_text="Ej: 573001234567")
    cupo_credito = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_pendiente = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.nombre} - Saldo: ${self.saldo_pendiente}"

    def generar_enlace_whatsapp(self, nombre_negocio="Comercializadora"):
        mensaje = f"Hola {self.nombre}, le recordamos que su saldo pendiente en {nombre_negocio} es de ${self.saldo_pendiente:,.0f} COP."
        mensaje_encriptado = urllib.parse.quote(mensaje)
        telefono_limpio = ''.join(filter(str.isdigit, self.telefono))
        return f"https://wa.me/{telefono_limpio}?text={mensaje_encriptado}"

class AbonoCartera(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='abonos')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    registrado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    def __str__(self):
        return f"Abono de ${self.monto} - {self.cliente.nombre}"