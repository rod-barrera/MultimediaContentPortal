import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Video = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/video/${id}`);
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error('Error fetching the video:', error);
      }
    };

    fetchVideo();
  }, [id]);

  if (!video) return null;

  return (
    <div className="card m-3">
      <div className="d-flex justify-content-center border-bottom">
        <video controls className="card-img-top" style={{ width: 'auto', maxWidth: '100%' }}>
          <source src={`../${video.url}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="card-body">
        <h4 className="card-title text-center mb-3">{video.title}</h4>
        <p className="card-text">{video.description}</p>
      </div>
    </div>
  );
};

export default Video;