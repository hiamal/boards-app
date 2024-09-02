import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import ChatDashboard from './ChatDashboard'; // Import the ChatDashboard

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat-dashboard" element={<ChatDashboard />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
};

export default App;
