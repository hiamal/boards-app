import React, { useState } from 'react';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        console.log('Google user:', result.user);
        navigate('/chat-dashboard'); // Navigate to Chat Dashboard
      })
      .catch((error) => {
        console.error('Error during Google sign-in:', error);
      });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User signed up:', userCredential.user);
        setMessage('User successfully created!');
      })
      .catch((error) => {
        console.error('Error during sign-up:', error);
        setMessage('Error creating user.');
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        navigate('/chat-dashboard'); // Navigate to Chat Dashboard
      })
      .catch((error) => {
        console.error('Error during login:', error);
        setMessage('Error logging in.');
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isSignUp ? 'Sign Up for Boards App' : 'Login to Boards App'}</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
          <p>or</p>
          <button type="button" className="btn google-btn" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
