from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView  # <-- Importante agregar esta línea
from . import views
urlpatterns = [
     path('', views.pos_view, name='base'),
]