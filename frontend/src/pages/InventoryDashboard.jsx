import React from "react";
import { Link, useNavigate } from "react-router-dom";

function InventoryDashboard() {
  const navigate = useNavigate();

  let user = {};
  let organization = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
    organization = JSON.parse(
      localStorage.getItem("organization") || "{}"
    );
  } catch (error) {
    console.error("Local storage error:", error);
  }

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("organization");
    navigate("/signin");
  }

  return (
    <div className="page">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-mark">M</div>

          <div>
            <strong>MultiTenant</strong>
            <small>Organization Platform</small>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/inventory-dashboard"
            className="sidebar-link active"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/products"
            className="sidebar-link"
          >
            📦 Products
          </Link>

          <Link
            to="/orders"
            className="sidebar-link"
          >
            🛒 Orders
          </Link>

        </nav>

        <div className="sidebar-user">

          <div className="user-avatar">
            {(user.name || "I").charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name || "Inventory Manager"}</strong>
            <small>Inventory Manager</small>
          </div>

        </div>

        <button
          type="button"
          className="signout-button"
          onClick={signOut}
        >
          ↪ Sign Out
        </button>

      </aside>

      <main className="main-content">

        <section className="dashboard-hero">

          <div className="pill">
            <span className="live-dot"></span>
            INVENTORY WORKSPACE
          </div>

          <h1>
            Welcome back, {user.name || "Inventory Manager"}
          </h1>

          <p>
            Manage your organization's products, inventory and
            customer orders from your workspace.
          </p>

          <div className="organization-card">

            <div className="organization-icon">
              {(organization.name || "O").charAt(0).toUpperCase()}
            </div>

            <div>
              <small>ORGANIZATION</small>

              <h3>
                {organization.organizationName ||
                  organization.name ||
                  "Organization"}
              </h3>

              <span>
                {organization.organizationId || ""}
              </span>
            </div>

          </div>

        </section>

        <section className="dashboard-grid">

          <Link
            to="/products"
            className="dashboard-card"
          >
            <div className="card-icon">📦</div>

            <div>
              <h3>Products</h3>

              <p>
                Create, update, delete and manage product
                visibility.
              </p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

          <Link
            to="/orders"
            className="dashboard-card"
          >
            <div className="card-icon">🛒</div>

            <div>
              <h3>Orders</h3>

              <p>
                View customer orders and monitor order activity.
              </p>
            </div>

            <span className="card-arrow">→</span>
          </Link>

        </section>

        <section className="role-info-card">

          <div className="section-eyebrow">
            YOUR ROLE
          </div>

          <h2>Inventory Manager</h2>

          <p>
            You have permission to manage products and inventory.
            You can also read customer orders, but you cannot
            update their status.
          </p>

          <div className="permission-list">

            <div>
              <span>✓</span>
              Product Create
            </div>

            <div>
              <span>✓</span>
              Product Read
            </div>

            <div>
              <span>✓</span>
              Product Update
            </div>

            <div>
              <span>✓</span>
              Product Delete
            </div>

            <div>
              <span>✓</span>
              Order Read
            </div>

            <div>
              <span>×</span>
              Order Update
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default InventoryDashboard;