import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusAlert from '../components/StatusAlert';
import './AuthPages.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return 'Name, email and password are required.';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <p className="muted">Create your banking profile</p>

        <StatusAlert type="error" message={error} />

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;