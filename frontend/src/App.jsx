import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Documents from './components/Documents';
import Images from './components/Images';
import Videos from './components/Videos';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Document from './pages/Document';
import Image from './pages/Image';
import Video from './pages/Video';
import PrivateRoute from './admin/PrivateRoute';
import AdminLogin from './admin/AdminLogin';
import Upload from './admin/Upload';
import Panel from './admin/Panel';
import Edit from './admin/Edit';

import './App.css';

function App() {
  return (
    <Router>
      <div className="main-container">
        <Main />
      </div>
    </Router>
  );
}

function Main() {
  return (
    <Routes>
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/*" element={<PrivateRoutes />} />
    </Routes>
  );
}

function PublicRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/document/:id" element={<Document />} />
        <Route path="/image/:id" element={<Image />} />
        <Route path="/video/:id" element={<Video />} />
      </Routes>
    </>
  );
}

function PrivateRoutes() {
  return (
    <PrivateRoute>
      <>
        <AdminNavbar />
        <Routes>
          <Route path="/panel" element={<Panel />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/edit/:type/:id" element={<Edit />} />
        </Routes>
      </>
    </PrivateRoute>
  );
}

export default App;