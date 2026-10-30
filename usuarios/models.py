
# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import User
from inventario.models import Tienda

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tienda = models.ForeignKey(Tienda, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.tienda.nombre}"