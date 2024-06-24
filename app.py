import os  # Importa el módulo os para interactuar con el sistema operativo
from flask import Flask, request, jsonify  # Importa Flask y funciones relacionadas
from flask_migrate import Migrate  # Importa Migrate para manejar migraciones de la base de datos
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity  # Importa JWTManager y funciones relacionadas para manejar JWT
from flask_cors import CORS  # Importa CORS para manejar las políticas de recursos compartidos
from sqlalchemy import desc  # Importa desc para ordenar consultas en orden descendente
from datetime import timedelta  # Importa timedelta para manejar duraciones de tiempo
from dotenv import load_dotenv  # Importa load_dotenv para cargar variables de entorno desde un archivo .env
from models import db, Admin, Document, Image, Video  # Importa los modelos de la base de datos
from ftplib import FTP  # Importa FTP para interactuar con un servidor FTP

load_dotenv()  # Cargar las variables de entorno desde el archivo .env

app = Flask(__name__)  # Crear la aplicación Flask

app.config['DEBUG'] = True  # Habilitar el modo de depuración
app.config['ENV'] = 'development'  # Establecer el entorno de desarrollo
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Deshabilitar el seguimiento de modificaciones de SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASEURI')  # URI de la base de datos desde el archivo .env
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Clave secreta para JWT desde el archivo .env
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # Tamaño máximo del contenido permitido (500 MB)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)  # Tiempo de expiración del token JWT (30 minutos)

# Configuración del FTP
FTP_HOST = os.getenv('FTP_HOST')  # Host del FTP desde el archivo .env
FTP_USER = os.getenv('FTP_USER')  # Usuario del FTP desde el archivo .env
FTP_PASS = os.getenv('FTP_PASS')  # Contraseña del FTP desde el archivo .env
FTP_FOLDER = os.getenv('FTP_FOLDER')  # Carpeta base del FTP desde el archivo .env

db.init_app(app)  # Inicializa la base de datos con la aplicación Flask
Migrate(app, db)  # Inicializa las migraciones con la aplicación Flask y la base de datos
jwt = JWTManager(app)  # Inicializa el gestor de JWT con la aplicación Flask
CORS(app, resources={r"/*": {"origins": ["https://host.cl", "https://www.host.cl"]}})  # Habilitar CORS para permitir solicitudes desde dominios específicos

# Inicializar la base de datos y crear las tablas si no existen
with app.app_context():  # Crear un contexto de la aplicación
    db.create_all()  # Crear todas las tablas en la base de datos

@app.route('/login', methods=['POST'])  # Define una ruta para el inicio de sesión que acepta solicitudes POST
def login():
    data = request.get_json()  # Obtener los datos JSON de la solicitud
    username = data.get('username')  # Obtener el nombre de usuario del JSON
    password = data.get('password')  # Obtener la contraseña del JSON
    
    admin = Admin.query.filter_by(username=username).first()  # Consulta la base de datos para encontrar al administrador
    
    if admin and admin.check_password(password):  # Verificar si el administrador existe y la contraseña es correcta
        access_token = create_access_token(identity={'username': admin.username})  # Crear un token de acceso JWT
        return jsonify(access_token=access_token), 200  # Devolver el token de acceso en la respuesta con un código 200
    else:
        return jsonify({"msg": "Invalid username or password"}), 401  # Devolver un error si la autenticación falla con un código 401
    
@app.route('/validate_token', methods=['GET'])  # Define una ruta para validar el token JWT que acepta solicitudes GET
@jwt_required()  # Requiere un token JWT válido para acceder a esta ruta
def validate_token():
    current_user = get_jwt_identity()  # Obtener la identidad del usuario actual a partir del token JWT
    if current_user:  # Verificar si se ha obtenido la identidad del usuario
        return jsonify({"msg": "Token is valid", "user": current_user}), 200  # Devolver que el token es válido y la identidad del usuario con un código 200
    else:
        return jsonify({"msg": "Invalid token"}), 401  # Devolver un error si el token es inválido con un código 401

def upload_to_ftp(file, filename, folder):
    ftp = FTP(FTP_HOST)  # Conectar al servidor FTP usando las credenciales configuradas
    ftp.login(FTP_USER, FTP_PASS)  # Iniciar sesión en el FTP
    ftp.cwd(folder)  # Cambiar al directorio especificado en el FTP
    
    file.seek(0)  # Asegurarse de leer desde el inicio del archivo
    ftp.storbinary(f'STOR {filename}', file)  # Subir el archivo al FTP usando el comando STOR
    
    ftp.quit()  # Cerrar la conexión FTP

@app.route('/upload', methods=['POST'])  # Define una ruta para subir archivos que acepta solicitudes POST
@jwt_required()  # Requiere un token JWT válido para acceder a esta ruta
def upload_file():
    try:
        current_user = get_jwt_identity()  # Obtener la identidad del usuario actual a partir del token JWT
        file = request.files.get('file')  # Obtener el archivo de la solicitud
        file_type = request.form.get('type')  # Obtener el tipo de archivo de la solicitud
        title = request.form.get('title')  # Obtener el título del archivo de la solicitud
        description = request.form.get('description')  # Obtener la descripción del archivo de la solicitud

        print(f"Received upload request: type={file_type}, title={title}, description={description}, file={file}")  # Imprimir detalles de la solicitud para depuración

        if file_type not in ['document', 'image', 'video']:  # Verificar si el tipo de archivo es válido
            return jsonify({"msg": "Invalid file type"}), 400  # Devolver un error si el tipo de archivo es inválido con un código 400

        if file_type != 'document' and not file:  # Verificar si el archivo es obligatorio y no se ha proporcionado
            return jsonify({"msg": "File is required for images and videos"}), 400  # Devolver un error si falta el archivo con un código 400

        if file:  # Si se ha proporcionado un archivo
            file.seek(0, 2)  # Mover al final del archivo para obtener el tamaño
            file_length = file.tell()  # Obtener el tamaño del archivo
            file.seek(0)  # Volver al inicio del archivo
            if file_length > app.config['MAX_CONTENT_LENGTH']:  # Verificar si el archivo excede el tamaño máximo permitido
                return jsonify({"msg": "File is too large"}), 413  # Devolver un error si el archivo es demasiado grande con un código 413

        file_ext = os.path.splitext(file.filename)[1] if file else ''  # Obtener la extensión del archivo
        folder_mapping = {  # Mapeo de tipos de archivo a carpetas
            'document': 'documents',
            'image': 'images',
            'video': 'videos'
        }
        folder = folder_mapping[file_type]  # Determinar la carpeta en el FTP según el tipo de archivo

        item = eval(file_type.capitalize()).query.order_by(eval(file_type.capitalize()).id.desc()).first()  # Obtener el último item de la base de datos
        item_id = item.id + 1 if item else 1  # Determinar el próximo ID
        filename = f"{item_id}{file_ext}"  # Crear el nombre del archivo

        relative_path = os.path.join('files', folder, filename).replace("\\", "/")  # Crear la ruta relativa del archivo

        new_file = eval(file_type.capitalize())(  # Crear una nueva instancia del archivo en la base de datos
            id=item_id,  # Establecer el ID del archivo
            title=title,  # Establecer el título del archivo
            description=description,  # Establecer la descripción del archivo
            url=relative_path if file else None,  # Establecer la URL del archivo
            admin_id=Admin.query.filter_by(username=current_user['username']).first().id  # Establecer el ID del administrador que subió el archivo
        )

        if file:  # Si se ha proporcionado un archivo
            upload_to_ftp(file, filename, os.path.join(FTP_FOLDER, folder))  # Subir el archivo al FTP

        db.session.add(new_file)  # Agregar el nuevo archivo a la sesión de la base de datos
        db.session.commit()  # Confirmar la transacción en la base de datos

        return jsonify({"msg": "File uploaded successfully"}), 200  # Devolver un mensaje de éxito con un código 200

    except Exception as e:  # Capturar cualquier excepción que ocurra
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500  # Devolver un mensaje de error con un código 500

@app.route('/documents', methods=['GET'])  # Define una ruta para obtener documentos que acepta solicitudes GET
def get_documents():
    documents = Document.query.order_by(desc(Document.id)).all()  # Consultar todos los documentos en orden descendente por ID
    documents_list = [{  # Crear una lista de diccionarios con los detalles de cada documento
        'id': document.id,
        'title': document.title,
        'description': document.description,
        'url': document.url
    } for document in documents]
    return jsonify(documents_list), 200  # Devolver la lista de documentos en la respuesta con un código 200

@app.route('/images', methods=['GET'])  # Define una ruta para obtener imágenes que acepta solicitudes GET
def get_images():
    images = Image.query.order_by(desc(Image.id)).all()  # Consultar todas las imágenes en orden descendente por ID
    images_list = [{  # Crear una lista de diccionarios con los detalles de cada imagen
        'id': image.id,
        'title': image.title,
        'description': image.description,
        'url': image.url
    } for image in images]
    return jsonify(images_list), 200  # Devolver la lista de imágenes en la respuesta con un código 200

@app.route('/videos', methods=['GET'])  # Define una ruta para obtener videos que acepta solicitudes GET
def get_videos():
    videos = Video.query.order_by(desc(Video.id)).all()  # Consultar todos los videos en orden descendente por ID
    videos_list = [{  # Crear una lista de diccionarios con los detalles de cada video
        'id': video.id,
        'title': video.title,
        'description': video.description,
        'url': video.url
    } for video in videos]
    return jsonify(videos_list), 200  # Devolver la lista de videos en la respuesta con un código 200

@app.route('/api/<string:item_type>/<int:id>', methods=['GET'])  # Define una ruta para obtener un ítem por tipo e ID que acepta solicitudes GET
def get_item(item_type, id):
    model_mapping = {  # Mapeo de tipos de ítems a modelos
        'document': Document,
        'image': Image,
        'video': Video
    }
    
    model = model_mapping.get(item_type)  # Obtener el modelo correspondiente al tipo de ítem
    if not model:  # Verificar si el tipo de ítem es válido
        return jsonify({"msg": "Invalid item type"}), 400  # Devolver un error si el tipo de ítem es inválido con un código 400
    
    item = model.query.get_or_404(id)  # Obtener el ítem de la base de datos por ID, devolver 404 si no existe
    response = {  # Crear un diccionario con los detalles del ítem
        'id': item.id,
        'title': item.title,
        'description': item.description,
        'url': item.url
    }
    
    return jsonify(response)  # Devolver los detalles del ítem en la respuesta

@app.route('/api/<string:item_type>/<int:id>', methods=['PUT'])  # Define una ruta para actualizar un ítem por tipo e ID que acepta solicitudes PUT
@jwt_required()  # Requiere un token JWT válido para acceder a esta ruta
def update_item(item_type, id):
    data = request.get_json()  # Obtener los datos JSON de la solicitud
    model_mapping = {  # Mapeo de tipos de ítems a modelos
        'document': Document,
        'image': Image,
        'video': Video
    }
    
    model = model_mapping.get(item_type)  # Obtener el modelo correspondiente al tipo de ítem
    if not model:  # Verificar si el tipo de ítem es válido
        return jsonify({"msg": "Invalid item type"}), 400  # Devolver un error si el tipo de ítem es inválido con un código 400
    
    item = model.query.get_or_404(id)  # Obtener el ítem de la base de datos por ID, devolver 404 si no existe
    item.title = data.get('title', item.title)  # Actualizar el título del ítem si se proporciona
    item.description = data.get('description', item.description)  # Actualizar la descripción del ítem si se proporciona
    db.session.commit()  # Confirmar la transacción en la base de datos
    return jsonify({"msg": f"{item_type.capitalize()} updated successfully"}), 200  # Devolver un mensaje de éxito con un código 200

@app.route('/api/<string:item_type>/<int:id>', methods=['DELETE'])  # Define una ruta para eliminar un ítem por tipo e ID que acepta solicitudes DELETE
@jwt_required()  # Requiere un token JWT válido para acceder a esta ruta
def delete_item(item_type, id):
    model_mapping = {  # Mapeo de tipos de ítems a modelos
        'document': Document,
        'image': Image,
        'video': Video
    }
    
    model = model_mapping.get(item_type)  # Obtener el modelo correspondiente al tipo de ítem
    if not model:  # Verificar si el tipo de ítem es válido
        return jsonify({"msg": "Invalid item type"}), 400  # Devolver un error si el tipo de ítem es inválido con un código 400
    
    item = model.query.get_or_404(id)  # Obtener el ítem de la base de datos por ID, devolver 404 si no existe
    
    if item_type in ['image', 'video'] or (item_type == 'document' and item.url):  # Si el ítem tiene un archivo asociado en el FTP
        try:
            ftp = FTP(FTP_HOST)  # Conectar al servidor FTP usando las credenciales configuradas
            ftp.login(FTP_USER, FTP_PASS)  # Iniciar sesión en el FTP
            file_path = os.path.join(FTP_FOLDER, item.url.replace('files/', '', 1)).replace("\\", "/")  # Crear la ruta del archivo en el FTP
            print(f"Deleting file at: {file_path}")  # Imprimir la ruta del archivo para depuración
            ftp.delete(file_path)  # Eliminar el archivo del FTP
            ftp.quit()  # Cerrar la conexión FTP
        except Exception as e:  # Capturar cualquier excepción que ocurra
            print(f"FTP error: {e}")  # Imprimir el error en el servidor
            return jsonify({"msg": f"Error deleting file from FTP: {e}"}), 500  # Devolver un mensaje de error con un código 500

    db.session.delete(item)  # Eliminar el ítem de la base de datos
    db.session.commit()  # Confirmar la transacción en la base de datos
    return jsonify({"msg": f"{item_type.capitalize()} deleted successfully"}), 200  # Devolver un mensaje de éxito con un código 200

if __name__ == '__main__':  # Si se ejecuta este script directamente
    app.run(host='0.0.0.0', port=5000)  # Ejecutar la aplicación Flask en el puerto 5000