import React, { useState, useEffect } from 'react';

const Images = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/images`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          let data = await response.json();
          // Truncar la descripción al obtener los datos
          data = data.map(image => ({
            ...image,
            description: image.description.length > 100 ? image.description.substring(0, 100) + '...' : image.description
          }));
          setImages(data);
        } else {
          setError('Failed to fetch images');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center">Imágenes</h1>
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <div className="row justify-content-center">
        <div className="col-md-6">
          {images.map((image) => (
            <div key={image.id} className="card mb-4 shadow-sm">
              <img
                src={image.url}
                className="card-img-top"
                alt={image.title}
                style={{ maxHeight: '500px', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="card-body">
                <h5 className="card-title">{image.title}</h5>
                <p className="card-text">{image.description}</p>
              </div>
              <div className="card-footer d-flex justify-content-center">
                <small className="text-muted">
                  <a href={`../image/${image.id}`} className="text-decoration-none">Ver imagen</a>
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Images;