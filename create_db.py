from flask import Flask  # Importa Flask para crear la aplicación web
from flask_sqlalchemy import SQLAlchemy  # Importa SQLAlchemy para manejar la base de datos
from flask_migrate import Migrate  # Importa Migrate para manejar migraciones de la base de datos
import os  # Importa el módulo os para interactuar con el sistema operativo

app = Flask(__name__)  # Crea una instancia de la aplicación Flask

# Configuraciones de la aplicación Flask
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # URI de la base de datos, especificando que se utilizará SQLite y el archivo de la base de datos se llama 'database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Deshabilita el seguimiento de modificaciones de SQLAlchemy para mejorar el rendimiento

db = SQLAlchemy(app)  # Inicializa la extensión SQLAlchemy con la aplicación Flask
migrate = Migrate(app, db)  # Inicializa la extensión Migrate con la aplicación Flask y la base de datos

# Define el modelo Admin que representa la tabla 'admin' en la base de datos
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    username = db.Column(db.String(80), unique=True, nullable=False)  # Columna 'username' de tipo cadena, única y no nula
    password_hash = db.Column(db.String(200), nullable=False)  # Columna 'password_hash' de tipo cadena, no nula

    def __repr__(self):
        return f'<Admin {self.username}>'  # Representación del modelo Admin como cadena

# Define el modelo Document que representa la tabla 'document' en la base de datos
class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    title = db.Column(db.String(200), nullable=False)  # Columna 'title' de tipo cadena, no nula
    description = db.Column(db.Text, nullable=True)  # Columna 'description' de tipo texto, opcional
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)  # Columna 'admin_id' de tipo entero, clave foránea que referencia a la tabla 'admin'
    admin = db.relationship('Admin', backref=db.backref('documents', lazy=True))  # Define la relación con el modelo Admin, permitiendo el acceso a los documentos desde el administrador

    def __repr__(self):
        return f'<Document {self.title}>'  # Representación del modelo Document como cadena

# Define el modelo Image que representa la tabla 'image' en la base de datos
class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    title = db.Column(db.String(200), nullable=False)  # Columna 'title' de tipo cadena, no nula
    description = db.Column(db.Text, nullable=True)  # Columna 'description' de tipo texto, opcional
    url = db.Column(db.String(500), nullable=False)  # Columna 'url' de tipo cadena, no nula
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)  # Columna 'admin_id' de tipo entero, clave foránea que referencia a la tabla 'admin'
    admin = db.relationship('Admin', backref=db.backref('images', lazy=True))  # Define la relación con el modelo Admin, permitiendo el acceso a las imágenes desde el administrador

    def __repr__(self):
        return f'<Image {self.title}>'  # Representación del modelo Image como cadena

# Define el modelo Video que representa la tabla 'video' en la base de datos
class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    title = db.Column(db.String(200), nullable=False)  # Columna 'title' de tipo cadena, no nula
    description = db.Column(db.Text, nullable=True)  # Columna 'description' de tipo texto, opcional
    url = db.Column(db.String(500), nullable=False)  # Columna 'url' de tipo cadena, no nula
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)  # Columna 'admin_id' de tipo entero, clave foránea que referencia a la tabla 'admin'
    admin = db.relationship('Admin', backref=db.backref('videos', lazy=True))  # Define la relación con el modelo Admin, permitiendo el acceso a los videos desde el administrador

    def __repr__(self):
        return f'<Video {self.title}>'  # Representación del modelo Video como cadena

if __name__ == '__main__':  # Si se ejecuta este script directamente
    with app.app_context():  # Crear un contexto de la aplicación
        db.create_all()  # Crear todas las tablas en la base de datos