import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Image = () => {
  const { id } = useParams();
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/image/${id}`);
        const data = await response.json();
        setImage(data);
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };

    fetchImage();
  }, [id]);

  if (!image) return null;

  return (
    <div className="card m-3">
      <div className="d-flex justify-content-center border-bottom">
        <img src={`../${image.url}`} className="card-img-top" alt={image.title} style={{ width: 'auto', maxWidth: '100%' }} />
      </div>
      <div className="card-body">
        <h4 className="card-title text-center mb-3">{image.title}</h4>
        <p className="card-text">{image.description}</p>
      </div>
    </div>
  );
};

export default Image;