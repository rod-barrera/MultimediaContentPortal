import React, { useState, useEffect } from 'react';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/videos`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          let data = await response.json();
          // Truncar la descripción al obtener los datos
          data = data.map(video => ({
            ...video,
            description: video.description.length > 100 ? video.description.substring(0, 100) + '...' : video.description
          }));
          setVideos(data);
        } else {
          setError('Failed to fetch videos');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center">Videos</h1>
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <div className="row justify-content-center">
        <div className="col-md-6">
          {videos.map((video) => (
            <div key={video.id} className="card mb-4 shadow-sm">
              <video
                width="100%"
                controls
                style={{ maxHeight: '500px', objectFit: 'cover', objectPosition: 'center' }}
              >
                <source src={`../${video.url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{video.description}</p>
              </div>
              <div className="card-footer d-flex justify-content-center">
                <small className="text-muted">
                  <a href={`../video/${video.id}`} className="text-decoration-none">Ver video</a>
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Videos;