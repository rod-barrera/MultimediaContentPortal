import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [includeFile, setIncludeFile] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes

  const handleTypeChange = (e) => {
    setType(e.target.value);
    if (e.target.value === 'document') {
      setIncludeFile(false); // Reset the checkbox
    } else {
      setIncludeFile(true); // Ensure file is included for images and videos
    }
    setFile(null); // Clear the file when changing type
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError('El archivo excede el tamaño máximo permitido de 500MB');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleIncludeFileChange = () => {
    if (includeFile) {
      setFile(null); // Clear the file when unchecking the checkbox
    }
    setIncludeFile(!includeFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    setError(''); // Clear any previous errors
    setProgress(0); // Reset the progress bar

    if (file && file.size > MAX_FILE_SIZE) {
      setError('El archivo excede el tamaño máximo permitido de 500MB');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    if ((type === 'document' && includeFile && file) || (type !== 'document' && file)) {
      formData.append('file', file);
    }
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL}/upload`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded / event.total) * 100);
        setProgress(percentCompleted);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        navigate('/admin');
      } else {
        const data = JSON.parse(xhr.responseText);
        setError(data.msg || 'No se pudo subir el archivo');
        if (data.error) {
          console.error('Error details:', data.error); // Para ver detalles en la consola del navegador
        }
      }
    };

    xhr.onerror = () => {
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
      setUploading(false);
    };

    xhr.send(formData);
  };

  const isFormValid = () => {
    if (type === '' || title === '' || description === '' || ((type !== 'document' || (type === 'document' && includeFile)) && !file) || (file && file.size > MAX_FILE_SIZE)) {
      return false;
    }
    return true;
  };

  return (
    <div className="container mt-2">
      <h2 className="text-center">Subir Archivo</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Tipo:</label>
          <select
            className="form-select"
            id="type"
            value={type}
            onChange={handleTypeChange}
            required
            disabled={uploading}
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="document">Documento</option>
            <option value="image">Imagen</option>
            <option value="video">Video</option>
          </select>
        </div>
        {type === 'document' && (
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="includeFile"
              checked={includeFile}
              onChange={handleIncludeFileChange}
              disabled={uploading}
            />
            <label htmlFor="includeFile" className="form-check-label">¿Incluir archivo?</label>
          </div>
        )}
        {((type !== '' && type !== 'document') || (type === 'document' && includeFile)) && (
          <div className="mb-3">
            <label htmlFor="file" className="form-label">Archivo: (Máximo 500MB)</label>
            <input
              type="file"
              className="form-control"
              id="file"
              onChange={handleFileChange}
              required={(type !== 'document') || (type === 'document' && includeFile)}
              disabled={uploading}
            />
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Título:</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={uploading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descripción:</label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={uploading}
          ></textarea>
        </div>
        {uploading && (
          <div className="mb-3">
            <label className="form-label">Progreso de carga:</label>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">{progress}%</div>
            </div>
          </div>
        )}
        {!uploading && error && <div className="alert alert-danger">{error}</div>}
        {uploading && <div className="alert alert-info">Subiendo...</div>}
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary" disabled={uploading || !isFormValid()}>
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
