import React, { useState, useEffect } from 'react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          let data = await response.json();
          // Truncar la descripción al obtener los datos
          data = data.map(document => ({
            ...document,
            description: document.description.length > 300 ? document.description.substring(0, 100) + '...' : document.description
          }));
          setDocuments(data);
        } else {
          setError('Failed to fetch documents');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center">Documentos</h1>
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <div className="row justify-content-center">
        <div className="col-md-6">
          {documents.map((document) => (
            <div key={document.id} className="card mb-4 shadow-sm">
              {document.url && (
                <img src={document.url}
                  className="card-img-top"
                  alt={document.title}
                  style={{ maxHeight: '500px', objectFit: 'cover', objectPosition: 'center' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{document.title}</h5>
                <p className="card-text">{document.description}</p>
              </div>
              <div className="card-footer d-flex justify-content-center">
                <small className="text-muted">
                  <a href={`../document/${document.id}`} className="text-decoration-none">Ver documento</a>
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documents;