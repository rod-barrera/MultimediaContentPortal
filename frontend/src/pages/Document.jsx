import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Document = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/document/${id}`);
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching the document:', error);
      }
    };

    fetchDocument();
  }, [id]);

  if (!document) return null;

  return (
    <div className="card m-3">
      {document.url && (
        <div className="d-flex justify-content-center border-bottom">
          <img src={`../${document.url}`} className="card-img-top" alt={document.title} style={{ width: 'auto', maxWidth: '100%' }} />
        </div>
      )}
      <div className="card-body">
        <h4 className="card-title text-center mb-3">{document.title}</h4>
        <p className="card-text">{document.description}</p>
      </div>
    </div>
  );
};

export default Document;