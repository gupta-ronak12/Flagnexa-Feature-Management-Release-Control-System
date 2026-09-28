import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeatureFlags.css";

function FeatureFlags() {
  const navigate = useNavigate();

  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    key: "",
    name: "",
    description: "",
    flag_type: "boolean",
    default_value: true,
    enabled: true,
  });

  // --------------------------------------------------
  // Load feature flags when page opens
  // --------------------------------------------------
  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/feature-flags/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to load feature flags")
        );
      }

      let featureFlags = [];

      if (Array.isArray(data)) {
        featureFlags = data;
      } else if (Array.isArray(data?.flags)) {
        featureFlags = data.flags;
      } else if (Array.isArray(data?.data)) {
        featureFlags = data.data;
      } else if (Array.isArray(data?.items)) {
        featureFlags = data.items;
      }

      setFlags(featureFlags);
      setMessage("");
    } catch (error) {
      console.error("GET feature flags error:", error);
      setMessage(error.message || "Failed to load feature flags");
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Convert backend error into readable text
  // --------------------------------------------------
  const getErrorMessage = (data, fallback) => {
    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return JSON.stringify(item);
        })
        .join(", ");
    }

    if (data.detail && typeof data.detail === "object") {
      if (data.detail.message) {
        return data.detail.message;
      }

      if (data.detail.msg) {
        return data.detail.msg;
      }

      return JSON.stringify(data.detail);
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return fallback;
  };

  // --------------------------------------------------
  // Form input
  // --------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --------------------------------------------------
  // Flag type change
  // --------------------------------------------------
  const handleFlagTypeChange = (e) => {
    const value = e.target.value;

    setForm((previous) => ({
      ...previous,
      flag_type: value,
      default_value:
        value === "boolean"
          ? true
          : value === "number"
          ? 0
          : "",
    }));
  };

  // --------------------------------------------------
  // Create feature flag
  // --------------------------------------------------
  const handleCreateFlag = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const requestBody = {
        key: form.key.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        flag_type: form.flag_type,
        default_value:
          form.flag_type === "boolean"
            ? form.default_value === true ||
              form.default_value === "true"
            : form.flag_type === "number"
            ? Number(form.default_value)
            : form.default_value,
        enabled: form.enabled,
      };

      const response = await fetch("/api/feature-flags/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to create feature flag")
        );
      }

      await fetchFlags();

      setForm({
        key: "",
        name: "",
        description: "",
        flag_type: "boolean",
        default_value: true,
        enabled: true,
      });

      setShowCreateForm(false);

      setMessage("Feature flag created successfully!");
    } catch (error) {
      console.error("Create feature flag error:", error);
      setMessage(error.message || "Failed to create feature flag");
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // --------------------------------------------------
  // Active flags count
  // --------------------------------------------------
  const activeFlags = flags.filter(
    (flag) => flag.enabled === true || flag.is_enabled === true
  ).length;

  return (
    <div className="feature-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            FF
          </div>

          <div>
            <h2>Feature Flags</h2>
            <span>Management System</span>
          </div>

        </div>


        <nav className="sidebar-nav">

          {/* Dashboard */}
          <button
            className="nav-item"
            onClick={() => navigate("/home")}
          >
            <span>▦</span>
            Dashboard
          </button>


          {/* Feature Flags */}
          <button
            className="nav-item active"
            onClick={() => navigate("/feature-flags")}
          >
            <span>⚑</span>
            Feature Flags
          </button>


          {/* Environments */}
          <button
            className="nav-item"
          >
            <span>◉</span>
            Environments
          </button>


          {/* Groups */}
          <button
            className="nav-item"
            onClick={() => navigate("/groups")}
          >
            <span>♟</span>
            Groups
          </button>


          {/* Targeting Rules */}
          <button
            className="nav-item"
            onClick={() => navigate("/targeting-rules")}
          >
            <span>🎯</span>
            Targeting Rules
          </button>


          {/* Percentage Rollouts */}
          <button
            className="nav-item"
          >
            <span>◔</span>
            Percentage Rollouts
          </button>


          {/* Evaluation */}
          <button
            className="nav-item"
          >
            <span>✓</span>
            Evaluation
          </button>


          {/* Analytics */}
          <button
            className="nav-item"
          >
            <span>▥</span>
            Analytics
          </button>

        </nav>


        {/* Logout */}
        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">

        <div className="page-container">

          {/* ================= HEADER ================= */}
          <header className="page-header">

            <div>

              <h1>
                Feature Flags
              </h1>

              <p>
                Create, manage and control your application features
              </p>

            </div>


            <button
              className="primary-button"
              onClick={() => {
                setShowCreateForm(true);
                setMessage("");
              }}
            >
              + Create Feature Flag
            </button>

          </header>


          {/* ================= MESSAGE ================= */}
          {message && (
            <div
              className={
                message.includes("successfully")
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </div>
          )}


          {/* ================= STATISTICS ================= */}
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon">
                ⚑
              </div>

              <div>

                <span>
                  Total Flags
                </span>

                <h3>
                  {flags.length}
                </h3>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                ✓
              </div>

              <div>

                <span>
                  Active Flags
                </span>

                <h3>
                  {activeFlags}
                </h3>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                ◉
              </div>

              <div>

                <span>
                  Environments
                </span>

                <h3>
                  3
                </h3>

              </div>

            </div>

          </section>


          {/* ================= ALL FEATURE FLAGS ================= */}
          <section className="content-card">

            <div className="section-header">

              <div>

                <h2>
                  All Feature Flags
                </h2>

                <p>
                  Manage the feature flags configured for your application.
                </p>

              </div>

            </div>


            {/* Loading */}
            {loading && (
              <div className="empty-state">

                <p>
                  Loading feature flags...
                </p>

              </div>
            )}


            {/* Empty */}
            {!loading && flags.length === 0 && (
              <div className="empty-state">

                <div className="empty-icon">
                  ⚑
                </div>

                <h3>
                  No feature flags yet
                </h3>

                <p>
                  You haven't created any feature flags.
                  Use the button above to create your first one.
                </p>

              </div>
            )}


            {/* Feature flag list */}
            {!loading && flags.length > 0 && (
              <div className="flag-list">

                {flags.map((flag) => (

                  <div
                    className="flag-row"
                    key={
                      flag.id ||
                      flag.flag_id ||
                      flag.key
                    }
                  >

                    <div className="flag-info">

                      <h3>
                        {flag.name ||
                          flag.key ||
                          "Unnamed Flag"}
                      </h3>

                      <p>
                        {flag.description ||
                          "No description available"}
                      </p>

                      <small>
                        Key: {flag.key || "N/A"}
                      </small>

                    </div>


                    <div className="flag-status">

                      {flag.enabled === true ||
                      flag.is_enabled === true ? (

                        <span className="status active">
                          Active
                        </span>

                      ) : (

                        <span className="status inactive">
                          Inactive
                        </span>

                      )}

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

        </div>

      </main>


      {/* ================= CREATE MODAL ================= */}
      {showCreateForm && (

        <div
          className="modal-overlay"
          onClick={() => {
            if (!creating) {
              setShowCreateForm(false);
            }
          }}
        >

          <div
            className="create-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="modal-header">

              <div>

                <h2>
                  Create Feature Flag
                </h2>

                <p>
                  Define a new feature flag for your application.
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  if (!creating) {
                    setShowCreateForm(false);
                  }
                }}
              >
                ×
              </button>

            </div>


            {/* Form */}
            <form onSubmit={handleCreateFlag}>

              {/* Flag Key */}
              <div className="form-group">

                <label htmlFor="flag-key">
                  Flag Key
                </label>

                <input
                  id="flag-key"
                  type="text"
                  name="key"
                  value={form.key}
                  onChange={handleInputChange}
                  placeholder="e.g. new_dashboard"
                  required
                />

                <small>
                  Unique identifier for the feature flag.
                </small>

              </div>


              {/* Flag Name */}
              <div className="form-group">

                <label htmlFor="flag-name">
                  Flag Name
                </label>

                <input
                  id="flag-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. New Dashboard"
                  required
                />

              </div>


              {/* Description */}
              <div className="form-group">

                <label htmlFor="flag-description">
                  Description
                </label>

                <textarea
                  id="flag-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this feature flag controls..."
                  rows="3"
                />

              </div>


              {/* Type + Default Value */}
              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="flag-type">
                    Flag Type
                  </label>

                  <select
                    id="flag-type"
                    name="flag_type"
                    value={form.flag_type}
                    onChange={handleFlagTypeChange}
                  >

                    <option value="boolean">
                      Boolean
                    </option>

                    <option value="string">
                      String
                    </option>

                    <option value="number">
                      Number
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label htmlFor="default-value">
                    Default Value
                  </label>

                  {form.flag_type === "boolean" ? (

                    <select
                      id="default-value"
                      name="default_value"
                      value={String(form.default_value)}
                      onChange={(e) =>
                        setForm((previous) => ({
                          ...previous,
                          default_value:
                            e.target.value === "true",
                        }))
                      }
                    >

                      <option value="true">
                        True
                      </option>

                      <option value="false">
                        False
                      </option>

                    </select>

                  ) : (

                    <input
                      id="default-value"
                      type={
                        form.flag_type === "number"
                          ? "number"
                          : "text"
                      }
                      name="default_value"
                      value={form.default_value}
                      onChange={handleInputChange}
                      required
                    />

                  )}

                </div>

              </div>


              {/* Enabled */}
              <label className="checkbox-row">

                <input
                  type="checkbox"
                  name="enabled"
                  checked={form.enabled}
                  onChange={handleInputChange}
                />

                <span>
                  Enable this feature flag
                </span>

              </label>


              {/* Actions */}
              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    if (!creating) {
                      setShowCreateForm(false);
                    }
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Feature Flag"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default FeatureFlags;