import React from 'react';
import Jumbotron from '../components/Jumbotron';

const Home = () => {
  return (
    <>
      <Jumbotron />
      <div className="container mt-3">
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Documentos</h5>
                <p className="card-text">Revise nuestros documentos.</p>
                <a href="/documents" className="btn btn-primary">Ver Documentos</a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Imágenes</h5>
                <p className="card-text">Revise nuestras imágenes.</p>
                <a href="/images" className="btn btn-primary">Ver Imágenes</a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Videos</h5>
                <p className="card-text">Revise nuestros videos.</p>
                <a href="/videos" className="btn btn-primary">Ver Videos</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;