import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Complaints from './pages/Complaints';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/departments"
          element={
            <Layout>
              <Departments />
            </Layout>
          }
        />
        <Route
          path="/complaints"
          element={
            <Layout>
              <Complaints />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
