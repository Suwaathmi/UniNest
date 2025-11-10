import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Add axios interceptor to include token in requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token && userType) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser({
          userId: response.data.userId,
          userType: response.data.userType,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email
        });
        setCurrentPage('dashboard');
      } else {
        // Invalid token, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setUser(null);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading UniNest...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={setCurrentPage} onLogin={setUser} />;
      case 'signup':
        return <Signup onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <Login onNavigate={setCurrentPage} onLogin={setUser} />;
    }
  };

  return (
    <div style={styles.container}>
      {!user && (
        <nav style={styles.nav}>
          <div style={styles.navBrand}>
            <h2 style={styles.brandText}>🏠 UniNest</h2>
            <p style={styles.brandSubtext}>Find Your Perfect Student Accommodation</p>
          </div>
          <div style={styles.navButtons}>
            <button
              style={{
                ...styles.navButton,
                ...(currentPage === 'login' ? styles.navButtonActive : {})
              }}
              onClick={() => setCurrentPage('login')}
            >
              Login
            </button>
            <button
              style={{
                ...styles.navButton,
                ...(currentPage === 'signup' ? styles.navButtonActive : {})
              }}
              onClick={() => setCurrentPage('signup')}
            >
              Sign Up
            </button>
          </div>
        </nav>
      )}
      
      <main style={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  navBrand: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandText: {
    margin: 0,
    color: '#667eea',
    fontSize: '1.8rem',
    fontWeight: '700'
  },
  brandSubtext: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem'
  },
  navButtons: {
    display: 'flex',
    gap: '1rem'
  },
  navButton: {
    padding: '0.5rem 1.5rem',
    border: '2px solid #667eea',
    backgroundColor: 'transparent',
    color: '#667eea',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  navButtonActive: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  main: {
    flex: 1
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e3e3e3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;