from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json

def iniciar_sesion_api(request):
    """Recibe las credenciales, verifica que existan y abre la sesión del usuario"""
    if request.method == 'POST':
        try:
            # Leer los datos que envían desde el frontend (como React o un formulario)
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            # Validar que los campos no vayan vacíos
            if not username or not password:
                return JsonResponse({'success': False, 'error': 'Ingresa tu usuario y contraseña'}, status=400)

            # authenticate() verifica en la base de datos si el usuario y la contraseña coinciden
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # login() abre la sesión activa para este usuario en el sistema
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'mensaje': f'¡Bienvenido de nuevo, {user.username}!',
                    'username': user.username
                })
            else:
                # Si las credenciales son incorrectas
                return JsonResponse({
                    'success': False, 
                    'error': 'Usuario o contraseña incorrectos'
                }, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
