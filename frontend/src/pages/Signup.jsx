import { useState } from 'react'
import './Auth.css'

function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Signup failed')
        return
      }

      setMessage('Signup successful!')

      setFullName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError('Unable to connect to the server.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-icon">
          🔐
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Sign up to manage your feature flags
        </p>

        <form className="auth-form" onSubmit={handleSignup}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Sign Up
          </button>

        </form>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        <p className="auth-footer">
          Already have an account?
          <a href="/login"> Log in</a>
        </p>

      </div>
    </div>
  )
}

export default Signup