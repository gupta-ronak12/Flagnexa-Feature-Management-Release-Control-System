import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/auth/home", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Authentication failed");
        }

        return data;
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setMessage("Session expired. Please login again.");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <p>{message || "Loading dashboard..."}</p>
        </div>
      </div>
    );
  }

  const userName = user.message || "User";

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">FF</div>

          <div>
            <h2>FeatureFlow</h2>
            <span>Management System</span>
          </div>
        </div>


        {/* ================= MAIN MENU ================= */}
        <div className="sidebar-section">

          <p className="sidebar-title">MAIN MENU</p>

          {/* Dashboard */}
          <button
            className="nav-item active"
            onClick={() => navigate("/home")}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>


          {/* Feature Flags */}
          <button
            className="nav-item"
            onClick={() => navigate("/feature-flags")}
          >
            <span className="nav-icon">⚑</span>
            <span>Feature Flags</span>
          </button>


          {/* Environments */}
          <button
            className="nav-item"
            onClick={() => navigate("/environments")}
          >
            <span className="nav-icon">◎</span>
            <span>Environments</span>
          </button>


          {/* Groups */}
          <button
            className="nav-item"
            onClick={() => navigate("/groups")}
          >
            <span className="nav-icon">👥</span>
            <span>Groups</span>
          </button>


          {/* Targeting Rules */}
          <button
            className="nav-item"
            onClick={() => navigate("/targeting-rules")}
          >
            <span className="nav-icon">🎯</span>
            <span>Targeting Rules</span>
          </button>


          {/* Percentage Rollouts */}
          <button
            className="nav-item"
            onClick={() => navigate("/rollouts")}
          >
            <span className="nav-icon">◔</span>
            <span>Percentage Rollouts</span>
          </button>


          {/* Evaluation */}
          <button
            className="nav-item"
            onClick={() => navigate("/evaluation")}
          >
            <span className="nav-icon">✓</span>
            <span>Evaluation</span>
          </button>


          {/* Analytics */}
          <button
            className="nav-item"
            onClick={() => navigate("/analytics")}
          >
            <span className="nav-icon">▥</span>
            <span>Analytics</span>
          </button>

        </div>


        {/* ================= SYSTEM ================= */}
        <div className="sidebar-section">

          <p className="sidebar-title">SYSTEM</p>

          <button className="nav-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </button>

        </div>


        {/* ================= SIDEBAR BOTTOM ================= */}
        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{userName}</strong>
              <span>{user.email}</span>
            </div>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>⇥</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">

        {/* ================= TOP HEADER ================= */}
        <header className="topbar">

          <div>

            <p className="breadcrumb">
              Home / Dashboard
            </p>

            <h1>Dashboard</h1>

            <p className="page-subtitle">
              Manage and monitor your feature flags
            </p>

          </div>


          <div className="topbar-user">

            <div className="notification">
              ♢
            </div>

            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span>{user.email}</span>
            </div>

          </div>

        </header>


        {/* ================= WELCOME CARD ================= */}
        <section className="welcome-card">

          <div className="welcome-content">

            <span className="welcome-badge">
              WELCOME BACK
            </span>

            <h2>
              Hello, {userName} 👋
            </h2>

            <p>
              Control your application features, environments,
              and releases from one place.
            </p>

            <button
              className="welcome-button"
              onClick={() => navigate("/feature-flags")}
            >
              Manage Feature Flags
              <span>→</span>
            </button>

          </div>


          <div className="welcome-graphic">

            <div className="graphic-circle">
              ⚡
            </div>

          </div>

        </section>


        {/* ================= STATISTICS ================= */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon blue">
                ⚑
              </div>

              <span className="stat-status">
                Total
              </span>

            </div>

            <h3>0</h3>

            <p>Total Feature Flags</p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon green">
                ✓
              </div>

              <span className="stat-status green-text">
                Active
              </span>

            </div>

            <h3>0</h3>

            <p>Active Flags</p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon purple">
                ◎
              </div>

              <span className="stat-status">
                Available
              </span>

            </div>

            <h3>3</h3>

            <p>Environments</p>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon orange">
                ↗
              </div>

              <span className="stat-status">
                Releases
              </span>

            </div>

            <h3>0</h3>

            <p>Active Rollouts</p>

          </div>

        </section>


        {/* ================= FEATURE FLAGS ================= */}
        <section className="content-card">

          <div className="section-header">

            <div>

              <h2>Feature Flags</h2>

              <p>
                Manage and control your application's feature releases.
              </p>

            </div>


            <button
              className="primary-button"
              onClick={() => navigate("/feature-flags")}
            >
              <span>+</span>
              Create Feature Flag
            </button>

          </div>


          <div className="empty-state">

            <div className="empty-icon">
              ⚑
            </div>

            <h3>No feature flags yet</h3>

            <p>
              Create your first feature flag to start managing
              application features and releases.
            </p>

            <button
              className="secondary-button"
              onClick={() => navigate("/feature-flags")}
            >
              Create Your First Flag
              <span>→</span>
            </button>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}
        <section className="quick-section">

          <div className="section-title">

            <h2>Quick Actions</h2>

            <p>
              Common tasks to manage your application.
            </p>

          </div>


          <div className="quick-grid">

            {/* Feature Flags */}
            <button
              className="quick-card"
              onClick={() => navigate("/feature-flags")}
            >

              <div className="quick-icon blue-bg">
                ⚑
              </div>

              <div>
                <h3>Feature Flags</h3>
                <p>Create and manage feature flags</p>
              </div>

              <span className="arrow">→</span>

            </button>


            {/* Groups */}
            <button
              className="quick-card"
              onClick={() => navigate("/groups")}
            >

              <div className="quick-icon purple-bg">
                👥
              </div>

              <div>
                <h3>Groups</h3>
                <p>Manage users and groups</p>
              </div>

              <span className="arrow">→</span>

            </button>


            {/* Targeting Rules */}
            <button
              className="quick-card"
              onClick={() => navigate("/targeting-rules")}
            >

              <div className="quick-icon green-bg">
                🎯
              </div>

              <div>
                <h3>Targeting Rules</h3>
                <p>Manage user and group targeting</p>
              </div>

              <span className="arrow">→</span>

            </button>


            {/* Environments */}
            <button
              className="quick-card"
              onClick={() => navigate("/environments")}
            >

              <div className="quick-icon purple-bg">
                ◎
              </div>

              <div>
                <h3>Environments</h3>
                <p>Manage development environments</p>
              </div>

              <span className="arrow">→</span>

            </button>


            {/* Analytics */}
            <button
              className="quick-card"
              onClick={() => navigate("/analytics")}
            >

              <div className="quick-icon green-bg">
                ▥
              </div>

              <div>
                <h3>Analytics</h3>
                <p>Monitor feature flag activity</p>
              </div>

              <span className="arrow">→</span>

            </button>

          </div>

        </section>


        {/* ================= ACCOUNT INFORMATION ================= */}
        <section className="account-card">

          <div className="account-header">

            <div>

              <h2>Account Information</h2>

              <p>
                Your current account details
              </p>

            </div>

          </div>


          <div className="account-grid">

            <div className="account-item">

              <span>Account ID</span>

              <strong>
                {user.user_id}
              </strong>

            </div>


            <div className="account-item">

              <span>Email Address</span>

              <strong>
                {user.email}
              </strong>

            </div>


            <div className="account-item">

              <span>Current Environment</span>

              <strong>
                <span className="environment-dot"></span>
                Development
              </strong>

            </div>


            <div className="account-item">

              <span>Account Status</span>

              <strong className="status-active">
                ● Active
              </strong>

            </div>

          </div>

        </section>


        {/* ================= FOOTER ================= */}
        <footer className="footer">
          FeatureFlow Management System · Dashboard
        </footer>

      </main>

    </div>
  );
}

export default Home;