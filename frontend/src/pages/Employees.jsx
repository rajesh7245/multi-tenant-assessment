import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Employees.css";
function Employees() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

function getStoredObject(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value || value === "undefined" || value === "null") {
      return {};
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return {};
  }
}

const user = getStoredObject("user");
const organization = getStoredObject("organization");

  const databaseName =
    user.databaseName || organization.databaseName;

  const API_URL = "http://localhost:5000/api/employees";

  async function loadRoles() {
    try {
      if (!databaseName) {
        setError(
          "Organization database information is missing. Please sign in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/roles?databaseName=${encodeURIComponent(
          databaseName
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load roles");
      }

      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      if (!databaseName) {
        setError(
          "Organization database information is missing. Please sign in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}?databaseName=${encodeURIComponent(
          databaseName
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load employees");
      }

      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
    loadEmployees();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.roleId
    ) {
      setError("All employee fields are required.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseName,
          name: form.name,
          email: form.email,
          password: form.password,
          roleId: Number(form.roleId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create employee"
        );
      }

      setMessage("Employee created successfully.");

      setForm({
        name: "",
        email: "",
        password: "",
        roleId: "",
      });

      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(employeeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/${employeeId}?databaseName=${encodeURIComponent(
          databaseName
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete employee"
        );
      }

      setMessage("Employee deleted successfully.");

      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>

          <div>
            <strong>MultiTenant</strong>
            <span>Organization Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">
            ▦ Dashboard
          </Link>

          <Link to="/products">
            📦 Products
          </Link>

          <Link to="/employees" className="active">
            👥 Employees & Roles
          </Link>

          <Link to="/orders">
            🛒 Orders
          </Link>

          <Link to="/tracking">
            📍 Customer Tracking
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "Admin"}</strong>
              <span>{user.role || "Admin"}</span>
            </div>
          </div>

          <Link
            to="/signin"
            className="signout"
            onClick={() => localStorage.clear()}
          >
            ↪ Sign Out
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="top-header">
          <div>
            <p className="eyebrow">
              TEAM MANAGEMENT
            </p>

            <h1>Employees & Roles</h1>

            <p className="header-description">
              Add employees and assign organization roles.
            </p>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "Admin"}</strong>
              <span>{user.role || "Admin"}</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="product-layout">
          {/* ADD EMPLOYEE */}
          <div className="product-form-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">
                  NEW TEAM MEMBER
                </p>

                <h2>Add Employee</h2>
              </div>

              <div className="heading-icon">
                ＋
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Employee Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter employee name"
              />

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="employee@example.com"
              />

              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />

              <label>Role</label>

              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
              >
                <option value="">
                  Select employee role
                </option>

                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="primary-button"
              >
                Add Employee →
              </button>
            </form>
          </div>

          {/* EMPLOYEE LIST */}
          <div className="products-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">
                  ORGANIZATION TEAM
                </p>

                <h2>Employees</h2>
              </div>

              <div className="product-count">
                {employees.length} Members
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ⏳
                </div>

                <h3>
                  Loading employees...
                </h3>
              </div>
            ) : employees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  👥
                </div>

                <h3>
                  No employees yet
                </h3>

                <p>
                  Add your first employee using
                  the form on the left.
                </p>
              </div>
            ) : (
              <div className="product-list">
                {employees.map((employee) => (
                  <div
                    className="product-row"
                    key={employee.id}
                  >
                    <div className="product-info">
                      <div className="product-icon">
                        {(employee.name || "E")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>
                          {employee.name}
                        </h3>

                        <p>
                          {employee.email}
                        </p>
                      </div>
                    </div>

                    <div className="product-meta">
                      <div>
                        <span>Role</span>

                        <strong>
                          {employee.role_name ||
                            "Unassigned"}
                        </strong>
                      </div>

                      <div>
                        <span>Employee ID</span>

                        <strong>
                          #{employee.id}
                        </strong>
                      </div>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(employee.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ROLE INFORMATION */}
        <section className="card role-information">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                ROLE BASED ACCESS
              </p>

              <h2>Available Roles</h2>
            </div>

            <div className="heading-icon">
              🔐
            </div>
          </div>

          <div className="role-grid">
            {roles.map((role) => (
              <div
                className="role-card"
                key={role.id}
              >
                <div className="role-header">
                  <div className="role-icon">
                    {role.name
                      ?.toLowerCase()
                      .includes("inventory")
                      ? "📦"
                      : "💼"}
                  </div>

                  <div>
                    <h3>
                      {role.name}
                    </h3>

                    <span>
                      {role.description ||
                        "Organization role"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Employees;