import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView


def vista_login(request): 
    # Si el usuario ya tiene sesión iniciada, lo mandamos directo al POS
    if request.user.is_authenticated:
        return redirect('/base/')  

    return render(request, 'inicio.html')
    
@csrf_exempt
def iniciar_sesion_api(request):
    """Recibe las credenciales, verifica que existan y abre la sesión del usuario"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'success': False, 'error': 'Ingresa tu usuario y contraseña'}, status=400)

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                
                # Detectar automáticamente el rol basado en is_staff o is_superuser
                if user.is_staff or user.is_superuser:
                    redirect_url = '/inicio/'  # Panel del Jefe / Administrador
                else:
                    redirect_url = '/caja/'    # Panel del Cajero (puedes ajustar esta ruta según tu urls.py)

                return JsonResponse({
                    'success': True,
                    'mensaje': f'¡Bienvenido de nuevo, {user.username}!',
                    'username': user.username,
                    'redirect_url': redirect_url
                })
            else:
                return JsonResponse({
                    'success': False, 
                    'error': 'Usuario o contraseña incorrectos'
                }, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

@csrf_exempt
def crear_cajero_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            first_name = data.get('nombre', '') # Nombre opcional
            
            # Verificamos si el usuario ya existe
            if User.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'error': 'Ese nombre de usuario ya está en uso'}, status=400)

            # Creamos el cajero (is_staff=False para que no sea administrador)
            nuevo_cajero = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                is_staff=False,  # Es cajero, no administrador
                is_superuser=False
            )
            
            return JsonResponse({
                'success': True,
                'mensaje': f'¡Cajero {username} creado con éxito!'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
@login_required(login_url='/base/')
def mostrar_inicio(request):
    return render(request, 'inicio.html')

@csrf_exempt
def api_listar_cajeros(request):
    """Devuelve la lista de cajeros"""
    try:
        cajeros = User.objects.filter(is_staff=False, is_superuser=False).values('id', 'username', 'first_name')
        lista_cajeros = [
            {'id': c['id'], 'username': c['username'], 'nombre': c['first_name']} 
            for c in cajeros
        ]
        return JsonResponse({'success': True, 'cajeros': lista_cajeros})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_eliminar_cajero(request, user_id):
    """Elimina un cajero por su ID"""
    if request.method == 'POST':
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse({'success': True, 'mensaje': 'Cajero eliminado correctamente'})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'El cajero no existe'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

def cerrar_sesion(request):
    logout(request) # Destruye la sesión en el servidor de forma explícita
    return redirect('/') # Redirige al login (que apunta a /base/)

# ✅ CORRECTO (Si es una Class-Based View)
@method_decorator([never_cache, login_required], name='dispatch')
class MiVistaAdmin(TemplateView):
    template_name = 'fronten/inicio.html'
    
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
@login_required(login_url='/base/')
def mostrar_caja(request):
    return render(request, 'cajeros.html')