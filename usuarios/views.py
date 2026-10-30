from django.shortcuts import render, redirect  # <--- Agregamos 'redirect' aquí
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

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
                return JsonResponse({
                    'success': True,
                    'mensaje': f'¡Bienvenido de nuevo, {user.username}!',
                    'username': user.username
                })
            else:
                return JsonResponse({
                    'success': False, 
                    'error': 'Usuario o contraseña incorrectos'
                }, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)