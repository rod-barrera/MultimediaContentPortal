import os  # Importa el módulo os para interactuar con el sistema operativo
from dotenv import load_dotenv  # Importa load_dotenv para cargar variables de entorno desde un archivo .env
from flask import Flask  # Importa Flask para crear la aplicación web
from models import db, Admin  # Importa db y Admin desde el módulo models

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = Flask(__name__)  # Crea una instancia de la aplicación Flask

# Configuraciones de la aplicación Flask
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASEURI')  # URI de la base de datos desde el archivo .env
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Deshabilita el seguimiento de modificaciones de SQLAlchemy para mejorar el rendimiento

db.init_app(app)  # Inicializa la extensión SQLAlchemy con la aplicación Flask

def create_admin(username, password):
    with app.app_context():  # Crea un contexto de la aplicación
        # Crear un nuevo administrador
        new_admin = Admin(username=username)  # Crea una nueva instancia de Admin con el nombre de usuario proporcionado
        new_admin.set_password(password)  # Establece la contraseña del nuevo administrador
        
        # Agregarlo a la base de datos
        db.session.add(new_admin)  # Agrega el nuevo administrador a la sesión de la base de datos
        db.session.commit()  # Confirma la transacción en la base de datos
        print(f"Admin {username} creado exitosamente.")  # Imprime un mensaje de éxito

if __name__ == '__main__':  # Si se ejecuta este script directamente
    username = input("Ingrese el nombre de usuario del admin: ")  # Solicita al usuario que ingrese el nombre de usuario del administrador
    password = input("Ingrese la contraseña del admin: ")  # Solicita al usuario que ingrese la contraseña del administrador
    create_admin(username, password)  # Llama a la función create_admin con el nombre de usuario y la contraseña proporcionados