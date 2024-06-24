import sys  # Importa el módulo sys que proporciona funciones y variables para manipular partes del intérprete de Python
sys.path.insert(0, '/var/www/html/flask_project')  # Inserta la ruta '/var/www/html/flask_project' al principio de la lista sys.path

from app import app as application  # Importa la aplicación Flask desde el módulo app y la renombra como application