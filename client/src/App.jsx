import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your pages (Make sure these paths match your folder structure!)
import HomePage from './pages/Public/HomePage'; 
import AuthPage from './pages/Auth/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The '/' path is your default Homepage */}
        <Route path="/" element={<HomePage />} />
        
        {/* The '/auth' path is your combined Login/Signup page */}
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;