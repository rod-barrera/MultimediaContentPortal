from flask_sqlalchemy import SQLAlchemy  # Importa SQLAlchemy para manejar la base de datos
from argon2 import PasswordHasher  # Importa PasswordHasher para manejar el hashing de contraseñas usando Argon2

db = SQLAlchemy()  # Inicializa una instancia de SQLAlchemy
ph = PasswordHasher()  # Inicializa una instancia de PasswordHasher

# Define el modelo Admin que representa la tabla 'admin' en la base de datos
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    username = db.Column(db.String(80), unique=True, nullable=False)  # Columna 'username' de tipo cadena, única y no nula
    password_hash = db.Column(db.String(200), nullable=False)  # Columna 'password_hash' de tipo cadena, no nula

    def __repr__(self):
        return f'<Admin {self.username}>'  # Representación del modelo Admin como cadena

    def set_password(self, password):
        self.password_hash = ph.hash(password)  # Hashea la contraseña usando Argon2 y la almacena en 'password_hash'

    def check_password(self, password):
        try:
            return ph.verify(self.password_hash, password)  # Verifica la contraseña ingresada contra el hash almacenado
        except:  # Si ocurre una excepción (por ejemplo, la verificación falla)
            return False  # Devuelve False indicando que la verificación falló

# Define el modelo Document que representa la tabla 'document' en la base de datos
class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Columna 'id' de tipo entero, clave primaria
    title = db.Column(db.String(200), nullable=False)  # Columna 'title' de tipo cadena, no nula
    description = db.Column(db.Text, nullable=True)  # Columna 'description' de tipo texto, opcional
    url = db.Column(db.String(500), nullable=True)  # Columna 'url' de tipo cadena, opcional
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