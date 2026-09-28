import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeatureFlags.css";

function TargetingRules() {
  const navigate = useNavigate();

  const [flags, setFlags] = useState([]);
  const [rules, setRules] = useState([]);

  const [selectedFlag, setSelectedFlag] = useState(null);

  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);

  const [message, setMessage] = useState("");

  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [addingRule, setAddingRule] = useState(false);

  const [ruleType, setRuleType] = useState("user");
  const [ruleValue, setRuleValue] = useState("");

  // --------------------------------------------------
  // Readable backend error
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
        .map((item) => item?.msg || String(item))
        .join(", ");
    }

    if (typeof data.detail === "object" && data.detail !== null) {
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
  // Load feature flags
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
      setLoadingFlags(true);
      setMessage("");

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
    } catch (error) {
      console.error("GET feature flags error:", error);

      setFlags([]);
      setMessage(
        error.message || "Failed to load feature flags"
      );
    } finally {
      setLoadingFlags(false);
    }
  };

  // --------------------------------------------------
  // Load targeting rules
  // --------------------------------------------------
  const fetchRules = async (flag) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingRules(true);
      setSelectedFlag(flag);
      setRules([]);
      setMessage("");

      const response = await fetch(
        `/api/targeting-rules/flag/${flag.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to load targeting rules"
          )
        );
      }

      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("GET targeting rules error:", error);

      setRules([]);

      setMessage(
        error.message || "Failed to load targeting rules"
      );
    } finally {
      setLoadingRules(false);
    }
  };

  // --------------------------------------------------
  // Add targeting rule
  // --------------------------------------------------
  const handleAddRule = async (e) => {
    e.preventDefault();

    if (!selectedFlag) {
      return;
    }

    if (!ruleValue.trim()) {
      setMessage("Please enter a target value.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setAddingRule(true);
      setMessage("");

      const response = await fetch(
        "/api/targeting-rules/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            flag_id: selectedFlag.id,
            rule_type: ruleType,
            rule_value: ruleValue.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to add targeting rule"
          )
        );
      }

      await fetchRules(selectedFlag);

      setRuleValue("");
      setRuleType("user");
      setShowAddRuleForm(false);

      setMessage(
        "Targeting rule added successfully!"
      );
    } catch (error) {
      console.error("Add targeting rule error:", error);

      setMessage(
        error.message || "Failed to add targeting rule"
      );
    } finally {
      setAddingRule(false);
    }
  };

  // --------------------------------------------------
  // Delete targeting rule
  // --------------------------------------------------
  const handleDeleteRule = async (ruleId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setMessage("");

      const response = await fetch(
        `/api/targeting-rules/${ruleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to remove targeting rule"
          )
        );
      }

      await fetchRules(selectedFlag);

      setMessage(
        "Targeting rule removed successfully!"
      );
    } catch (error) {
      console.error(
        "Delete targeting rule error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to remove targeting rule"
      );
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
  // Flag name
  // --------------------------------------------------
  const getFlagName = (flag) => {
    if (!flag) {
      return "Feature Flag";
    }

    return (
      flag.name ||
      flag.key ||
      flag.feature_key ||
      "Unnamed Flag"
    );
  };

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

          <button
            className="nav-item"
            onClick={() => navigate("/home")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/feature-flags")}
          >
            <span>⚑</span>
            Feature Flags
          </button>

          <button className="nav-item">
            <span>◉</span>
            Environments
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/groups")}
          >
            <span>👥</span>
            Groups
          </button>

          <button className="nav-item active">
            <span>🎯</span>
            Targeting Rules
          </button>

          <button className="nav-item">
            <span>▥</span>
            Analytics
          </button>

        </nav>

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
                Targeting Rules
              </h1>

              <p>
                Manage user and group targeting for feature flags.
              </p>
            </div>

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


          {/* ================= FEATURE FLAGS ================= */}
          <section className="content-card">

            <div className="section-header">

              <div>
                <h2>
                  Feature Flags
                </h2>

                <p>
                  Select a feature flag to manage its targeting rules.
                </p>
              </div>

            </div>


            {loadingFlags && (
              <div className="empty-state">
                <p>
                  Loading feature flags...
                </p>
              </div>
            )}


            {!loadingFlags &&
              flags.length === 0 && (
                <div className="empty-state">

                  <div className="empty-icon">
                    ⚑
                  </div>

                  <h3>
                    No feature flags
                  </h3>

                  <p>
                    Create a feature flag before adding targeting rules.
                  </p>

                </div>
              )}


            {!loadingFlags &&
              flags.length > 0 && (
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
                          {getFlagName(flag)}
                        </h3>

                        <p>
                          Flag ID:{" "}
                          {flag.id || flag.flag_id}
                        </p>

                        {flag.description && (
                          <small>
                            {flag.description}
                          </small>
                        )}

                      </div>

                      <div className="flag-status">

                        <button
                          className="primary-button"
                          onClick={() =>
                            fetchRules(flag)
                          }
                        >
                          View Rules
                        </button>

                      </div>

                    </div>

                  ))}

                </div>
              )}

          </section>


          {/* ================= TARGETING RULES ================= */}
          {selectedFlag && (

            <section className="content-card">

              <div className="section-header">

                <div>
                  <h2>
                    {getFlagName(selectedFlag)}
                    {" "}Targeting Rules
                  </h2>

                  <p>
                    Add or remove users and groups targeted by this flag.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setShowAddRuleForm(true);
                    setMessage("");
                  }}
                >
                  + Add Rule
                </button>

              </div>


              {loadingRules && (
                <div className="empty-state">
                  <p>
                    Loading targeting rules...
                  </p>
                </div>
              )}


              {!loadingRules &&
                rules.length === 0 && (
                  <div className="empty-state">

                    <div className="empty-icon">
                      🎯
                    </div>

                    <h3>
                      No targeting rules
                    </h3>

                    <p>
                      No users or groups are currently targeted.
                    </p>

                  </div>
                )}


              {!loadingRules &&
                rules.length > 0 && (
                  <div className="flag-list">

                    {rules.map((rule) => (

                      <div
                        className="flag-row"
                        key={rule.id}
                      >

                        <div className="flag-info">

                          <h3>
                            {rule.rule_type === "user"
                              ? "User Targeting"
                              : rule.rule_type === "group"
                              ? "Group Targeting"
                              : "Targeting Rule"}
                          </h3>

                          <p>
                            Type:{" "}
                            {rule.rule_type}
                          </p>

                          <small>
                            Target:{" "}
                            {rule.rule_value}
                          </small>

                        </div>

                        <div className="flag-status">

                          <button
                            className="cancel-button"
                            onClick={() =>
                              handleDeleteRule(rule.id)
                            }
                          >
                            Remove
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

            </section>

          )}

        </div>

      </main>


      {/* ================= ADD RULE MODAL ================= */}
      {showAddRuleForm &&
        selectedFlag && (

          <div
            className="modal-overlay"
            onClick={() => {
              if (!addingRule) {
                setShowAddRuleForm(false);
              }
            }}
          >

            <div
              className="create-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Add Targeting Rule
                  </h2>

                  <p>
                    Target {getFlagName(selectedFlag)}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    if (!addingRule) {
                      setShowAddRuleForm(false);
                    }
                  }}
                >
                  ×
                </button>

              </div>


              <form onSubmit={handleAddRule}>

                {/* Rule Type */}
                <div className="form-group">

                  <label htmlFor="rule-type">
                    Target Type
                  </label>

                  <select
                    id="rule-type"
                    value={ruleType}
                    onChange={(e) =>
                      setRuleType(e.target.value)
                    }
                  >
                    <option value="user">
                      User
                    </option>

                    <option value="group">
                      Group
                    </option>
                  </select>

                </div>


                {/* Rule Value */}
                <div className="form-group">

                  <label htmlFor="rule-value">
                    {ruleType === "user"
                      ? "User ID"
                      : "Group Name"}
                  </label>

                  <input
                    id="rule-value"
                    type="text"
                    value={ruleValue}
                    onChange={(e) =>
                      setRuleValue(e.target.value)
                    }
                    placeholder={
                      ruleType === "user"
                        ? "e.g. 9"
                        : "e.g. beta_users"
                    }
                    required
                  />

                  <small>
                    {ruleType === "user"
                      ? "Enter the user ID to target."
                      : "Enter the exact group name to target."}
                  </small>

                </div>


                {/* Actions */}
                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      if (!addingRule) {
                        setShowAddRuleForm(false);
                      }
                    }}
                    disabled={addingRule}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={addingRule}
                  >
                    {addingRule
                      ? "Adding..."
                      : "Add Rule"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>
  );
}

export default TargetingRules;