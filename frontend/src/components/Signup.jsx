import React, { useState } from 'react';
import './Signup.css';

const Signup = () => {
  const [userType, setUserType] = useState('STUDENT');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    university: '',
    businessName: '',
    businessRegistrationNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({
      ...formData,
      university: '',
      businessName: '',
      businessRegistrationNumber: ''
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (userType === 'STUDENT' && !formData.university) {
      setError('University is required for students');
      return false;
    }
    if (
      userType === 'HOSTEL_OWNER' &&
      (!formData.businessName || !formData.businessRegistrationNumber)
    ) {
      setError('Business name and registration number are required for hostel owners');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          userType,
          university: userType === 'STUDENT' ? formData.university : null,
          businessName: userType === 'HOSTEL_OWNER' ? formData.businessName : null,
          businessRegistrationNumber:
            userType === 'HOSTEL_OWNER' ? formData.businessRegistrationNumber : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please login to continue.');
        window.location.href = '/login';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Join UniNest</h2>
          <p>Create your account to get started</p>
        </div>

        <div className="user-type-selector">
          <button
            type="button"
            className={`user-type-btn ${userType === 'STUDENT' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('STUDENT')}
          >
            Student
          </button>
          <button
            type="button"
            className={`user-type-btn ${userType === 'HOSTEL_OWNER' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('HOSTEL_OWNER')}
          >
            Hostel Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          {userType === 'STUDENT' && (
            <div className="form-group">
              <label htmlFor="university">University</label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your university</option>
                <option value="University of Colombo">University of Colombo</option>
                <option value="University of Peradeniya">University of Peradeniya</option>
                <option value="University of Kelaniya">University of Kelaniya</option>
                <option value="University of Moratuwa">University of Moratuwa</option>
                <option value="University of Jaffna">University of Jaffna</option>
                <option value="University of Ruhuna">University of Ruhuna</option>
                <option value="Eastern University">Eastern University</option>
                <option value="Wayamba University">Wayamba University</option>
                <option value="Rajarata University">Rajarata University</option>
                <option value="Sabaragamuwa University">Sabaragamuwa University</option>
                <option value="Uva Wellassa University">Uva Wellassa University</option>
                <option value="South Eastern University">South Eastern University</option>
              </select>
            </div>
          )}

          {userType === 'HOSTEL_OWNER' && (
            <>
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="businessRegistrationNumber">Business Registration Number</label>
                <input
                  type="text"
                  id="businessRegistrationNumber"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

