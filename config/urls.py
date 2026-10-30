"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.urls import include, path
from django.views.generic import RedirectView
from usuarios.views import cerrar_sesion # Asegúrate de importarla
# Importaciones de vistas limpias (sin duplicar)
from usuarios.views import (
    api_eliminar_cajero,
    api_listar_cajeros,
    crear_cajero_api,
    iniciar_sesion_api,
    mostrar_inicio,
    mostrar_caja,
)



urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/base/', permanent=False), name='login'),
    path('base/', include('ventas.urls')),
    path('api/login/', iniciar_sesion_api, name='iniciar_sesion_api'),
    path('api/crear-cajero/', crear_cajero_api, name='crear_cajero_api'),
    path('api/cajeros/', api_listar_cajeros, name='api_listar_cajeros'),
    path('api/eliminar-cajero/<int:user_id>/', api_eliminar_cajero, name='api_eliminar_cajero'),
    path('inicio/', mostrar_inicio, name='inicio'),
    path('caja/', mostrar_caja, name='caja'),
    # Usamos nuestra función personalizada en lugar de LogoutView
    path('logout/', cerrar_sesion, name='logout'),
]