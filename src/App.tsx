import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { TrendingPage } from './pages/TrendingPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <div>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/movie/:id" element={<MovieDetailPage />} />
                  <Route 
                    path="/watchlist" 
                    element={
                      <ProtectedRoute>
                        <WatchlistPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            } />
          </Routes>
          
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(18, 18, 18, 0.95)', // Dark IMDb-like background with transparency
                color: '#ffffff', // White text for better readability
                fontWeight: '600',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #f5c518', // Gold border
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245, 197, 24, 0.2)',
                backdropFilter: 'blur(16px)',
                fontSize: '14px',
                maxWidth: '400px',
                textAlign: 'center',
              },
              success: {
                style: {
                  border: '1px solid #f5c518',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245, 197, 24, 0.2)',
                },
                iconTheme: {
                  primary: '#f5c518',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(239, 68, 68, 0.2)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  border: '1px solid #f5c518',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245, 197, 24, 0.2)',
                },
                iconTheme: {
                  primary: '#f5c518',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;