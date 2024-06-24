import React, { useState, useEffect } from 'react';

const Panel = () => {
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`);
      const data = await response.json();
      setDocuments(data);
    };

    const fetchImages = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/images`);
      const data = await response.json();
      setImages(data);
    };

    const fetchVideos = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/videos`);
      const data = await response.json();
      setVideos(data);
    };

    fetchDocuments();
    fetchImages();
    fetchVideos();
  }, []);

  const handleDelete = async () => {
    const { type, id } = itemToDelete;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Update state based on type
        if (type === 'document') {
          setDocuments(documents.filter((document) => document.id !== id));
        } else if (type === 'image') {
          setImages(images.filter((image) => image.id !== id));
        } else if (type === 'video') {
          setVideos(videos.filter((video) => video.id !== id));
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete item:', errorData);
      }
    } catch (err) {
      console.error('An error occurred. Please try again:', err);
    } finally {
      setItemToDelete(null);
    }
  };

  const renderEditLink = (type, id) => {
    return (
      <div className="d-flex justify-content-between">
        <a
          href={`/admin/edit/${type}/${id}`}
          className="btn btn-link text-decoration-none"
        >
          Editar
        </a>
        <button
          onClick={() => setItemToDelete({ type, id })}
          className="btn btn-link text-decoration-none text-danger"
          data-bs-toggle="modal"
          data-bs-target="#confirmDeleteModal"
        >
          Eliminar
        </button>
      </div>
    );
  };

  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  };

  return (
    <div className="container mt-1">
      <div className="row">
        <div className="col-md-4">
          <h3 className="text-center">Documents</h3>
          {documents.map((document) => (
            <div key={document.id} className="card mb-3">
              <div className="card-header">
                {renderEditLink('document', document.id)}
              </div>
              {document.url ? (
                <img src={`../${document.url}`} className="card-img-top" alt={document.title} />
              ) : null}
              <div className="card-body">
                <h5 className="card-title">{document.title}</h5>
                <p className="card-text">{truncateDescription(document.description, 100)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-4">
          <h3 className="text-center">Images</h3>
          {images.map((image) => (
            <div key={image.id} className="card mb-3">
              <div className="card-header">
                {renderEditLink('image', image.id)}
              </div>
              <img src={`../${image.url}`} className="card-img-top" alt={image.title} />
              <div className="card-body">
                <h5 className="card-title">{image.title}</h5>
                <p className="card-text">{truncateDescription(image.description, 100)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-4">
          <h3 className="text-center">Videos</h3>
          {videos.map((video) => (
            <div key={video.id} className="card mb-3">
              <div className="card-header">
                {renderEditLink('video', video.id)}
              </div>
              <video width="100%" controls>
                <source src={`../${video.url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{truncateDescription(video.description, 100)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmDeleteModal"
        tabIndex="-1"
        aria-labelledby="confirmDeleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirmDeleteModalLabel">Confirmar eliminación</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas eliminar este elemento?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                data-bs-dismiss="modal"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;