import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeatureFlags.css";

function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [removingUser, setRemovingUser] = useState(null);

  const [message, setMessage] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [userId, setUserId] = useState("");

  // --------------------------------------------------
  // Get readable backend error
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

    if (typeof data.message === "string") {
      return data.message;
    }

    return fallback;
  };

  // --------------------------------------------------
  // Load groups
  // --------------------------------------------------
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/user-groups/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to load groups")
        );
      }

      setGroups(Array.isArray(data) ? data : []);
      setMessage("");
    } catch (error) {
      console.error("GET groups error:", error);
      setGroups([]);
      setMessage(error.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load group members
  // --------------------------------------------------
  const fetchMembers = async (group) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingMembers(true);
      setSelectedGroup(group);
      setMessage("");

      const response = await fetch(
        `/api/user-groups/${group.id}/users`,
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
          getErrorMessage(data, "Failed to load group members")
        );
      }

      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("GET group members error:", error);
      setMembers([]);
      setMessage(
        error.message || "Failed to load group members"
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  // --------------------------------------------------
  // Create group
  // --------------------------------------------------
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const response = await fetch("/api/user-groups/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: groupName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to create group")
        );
      }

      await fetchGroups();

      setGroupName("");
      setShowCreateForm(false);

      setMessage("Group created successfully!");
    } catch (error) {
      console.error("Create group error:", error);
      setMessage(error.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------
  // Add user to group
  // --------------------------------------------------
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!selectedGroup) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setAddingUser(true);
      setMessage("");

      const response = await fetch(
        `/api/user-groups/${selectedGroup.id}/users/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to add user")
        );
      }

      await fetchMembers(selectedGroup);

      setUserId("");
      setShowAddUserForm(false);

      setMessage("User added to group successfully!");
    } catch (error) {
      console.error("Add user error:", error);
      setMessage(error.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  // --------------------------------------------------
  // Remove user from group
  // --------------------------------------------------
  const handleRemoveUser = async (user) => {
    if (!selectedGroup) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRemovingUser(user.id);
      setMessage("");

      const response = await fetch(
        `/api/user-groups/${selectedGroup.id}/users/${user.id}`,
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
          getErrorMessage(data, "Failed to remove user")
        );
      }

      await fetchMembers(selectedGroup);

      setMessage("User removed from group successfully!");
    } catch (error) {
      console.error("Remove user error:", error);
      setMessage(
        error.message || "Failed to remove user"
      );
    } finally {
      setRemovingUser(null);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="feature-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">FF</div>

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

          <button className="nav-item active">
            <span>👥</span>
            Groups
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
              <h1>User Groups</h1>

              <p>
                Create groups and manage their members.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setShowCreateForm(true);
                setMessage("");
              }}
            >
              + Create Group
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


          {/* ================= GROUPS ================= */}
          <section className="content-card">

            <div className="section-header">

              <div>
                <h2>Groups</h2>

                <p>
                  Select a group to view its members.
                </p>
              </div>

            </div>


            {loading && (
              <div className="empty-state">
                <p>Loading groups...</p>
              </div>
            )}


            {!loading && groups.length === 0 && (
              <div className="empty-state">

                <div className="empty-icon">👥</div>

                <h3>No groups yet</h3>

                <p>
                  Create your first user group.
                </p>

              </div>
            )}


            {!loading && groups.length > 0 && (
              <div className="flag-list">

                {groups.map((group) => (

                  <div
                    className="flag-row"
                    key={group.id}
                  >

                    <div className="flag-info">

                      <h3>{group.name}</h3>

                      <p>
                        Group ID: {group.id}
                      </p>

                    </div>


                    <div className="flag-status">

                      <button
                        className="primary-button"
                        onClick={() => fetchMembers(group)}
                      >
                        View Members
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>


          {/* ================= MEMBERS ================= */}
          {selectedGroup && (

            <section className="content-card">

              <div className="section-header">

                <div>
                  <h2>
                    {selectedGroup.name} Members
                  </h2>

                  <p>
                    Users currently assigned to this group.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setShowAddUserForm(true);
                    setMessage("");
                  }}
                >
                  + Add User
                </button>

              </div>


              {loadingMembers && (
                <div className="empty-state">
                  <p>Loading members...</p>
                </div>
              )}


              {!loadingMembers && members.length === 0 && (
                <div className="empty-state">

                  <div className="empty-icon">👤</div>

                  <h3>No members</h3>

                  <p>
                    No users are currently assigned to this group.
                  </p>

                </div>
              )}


              {!loadingMembers && members.length > 0 && (
                <div className="flag-list">

                  {members.map((user) => (

                    <div
                      className="flag-row"
                      key={user.id}
                    >

                      <div className="flag-info">

                        <h3>{user.full_name}</h3>

                        <p>{user.email}</p>

                        <small>
                          User ID: {user.id}
                        </small>

                      </div>


                      <div className="flag-status">

                        <button
                          className="cancel-button"
                          onClick={() => handleRemoveUser(user)}
                          disabled={removingUser === user.id}
                        >
                          {removingUser === user.id
                            ? "Removing..."
                            : "Remove"}
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


      {/* ================= CREATE GROUP MODAL ================= */}
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

            <div className="modal-header">

              <div>
                <h2>Create User Group</h2>

                <p>
                  Create a group for user targeting.
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


            <form onSubmit={handleCreateGroup}>

              <div className="form-group">

                <label htmlFor="group-name">
                  Group Name
                </label>

                <input
                  id="group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. beta_users"
                  required
                />

              </div>


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
                    : "Create Group"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= ADD USER MODAL ================= */}
      {showAddUserForm && selectedGroup && (

        <div
          className="modal-overlay"
          onClick={() => {
            if (!addingUser) {
              setShowAddUserForm(false);
            }
          }}
        >

          <div
            className="create-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h2>Add User</h2>

                <p>
                  Add a user to {selectedGroup.name}.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  if (!addingUser) {
                    setShowAddUserForm(false);
                  }
                }}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleAddUser}>

              <div className="form-group">

                <label htmlFor="user-id">
                  User ID
                </label>

                <input
                  id="user-id"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 9"
                  min="1"
                  required
                />

                <small>
                  Enter the ID of the user you want to add.
                </small>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    if (!addingUser) {
                      setShowAddUserForm(false);
                    }
                  }}
                  disabled={addingUser}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={addingUser}
                >
                  {addingUser
                    ? "Adding..."
                    : "Add User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Groups;