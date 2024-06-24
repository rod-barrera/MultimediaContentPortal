import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = () => {
  const { type, id } = useParams();
  const [item, setItem] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}/${id}`);
      const data = await response.json();
      setItem(data);
    };

    fetchItem();
  }, [type, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${type}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      navigate(`/admin/panel`);
    } else {
      console.error('Failed to update the item');
    }
  };

  if (!item) {
    return null;
  }

  return (
    <div className="container mt-2">
      <h2 className="text-center">Edit {type.charAt(0).toUpperCase() + type.slice(1)} {id}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input 
            type="text" 
            className="form-control" 
            id="title" 
            name="title" 
            value={item.title} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea 
            className="form-control" 
            id="description" 
            name="description" 
            value={item.description} 
            onChange={handleChange} 
            rows="5"
          />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default Edit;