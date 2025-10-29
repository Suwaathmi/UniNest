import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [backendData, setBackendData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your existing API calls
        const healthResponse = await axios.get('/api/health');
        setBackendData(healthResponse.data);
        
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data.users || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>
              Welcome, {user.firstName}! 
            </h1>
            <p style={styles.subtitle}>
              {user.userType === 'STUDENT' ? '🎓 Student Dashboard' : '🏢 Hostel Owner Dashboard'}
            </p>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* User Info Card */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Your Profile</h2>
        <div style={styles.userCard}>
          <div style={styles.userInfo}>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User Type:</strong> {user.userType === 'STUDENT' ? 'Student' : 'Hostel Owner'}</p>
            <p><strong>User ID:</strong> {user.userId}</p>
          </div>
        </div>
      </div>

      {/* Content based on user type */}
      {user.userType === 'STUDENT' ? (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔍 Find Accommodations</h2>
          <div style={styles.featureCard}>
            <p>Search and discover hostels near your university campus.</p>
            <button style={styles.actionBtn}>Browse Hostels</button>
          </div>
        </div>
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏠 Manage Your Hostels</h2>
          <div style={styles.featureCard}>
            <p>List your available rooms and manage bookings.</p>
            <button style={styles.actionBtn}>Add New Hostel</button>
          </div>
        </div>
      )}

      {/* Backend Status Section */}
      {backendData && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Backend Status</h2>
          <div style={styles.statusCard}>
            <p><strong>Status:</strong> {backendData.message}</p>
            <p><strong>Last Updated:</strong> {new Date(backendData.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Platform Users</h2>
        <div style={styles.usersGrid}>
          {users.length > 0 ? (
            users.map((userData, index) => (
              <div key={index} style={styles.userItem}>
                <p>{userData}</p>
              </div>
            ))
          ) : (
            <p style={styles.emptyMessage}>No users data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {user.userType === 'STUDENT' ? (
            <>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>🔍</span>
                Search Hostels
              </button>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>⭐</span>
                My Reviews
              </button>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>📋</span>
                My Bookings
              </button>
            </>
          ) : (
            <>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>🏠</span>
                Manage Hostels
              </button>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>📊</span>
                View Analytics
              </button>
              <button style={styles.quickActionBtn}>
                <span style={styles.actionIcon}>💰</span>
                Revenue Reports
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '0'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2rem',
    marginBottom: '2rem'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2.5rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: 0,
    fontSize: '1.2rem',
    opacity: 0.9
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto 2rem auto',
    padding: '0 2rem'
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '1rem',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  userCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
  },
  userInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  featureCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    textAlign: 'center'
  },
  statusCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    border: '1px solid #e9ecef'
  },
  actionBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'transform 0.2s ease',
    marginTop: '1rem'
  },
  usersGrid: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  userItem: {
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  quickActionBtn: {
    padding: '1.5rem',
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    fontSize: '1rem'
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
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

export default Dashboard;