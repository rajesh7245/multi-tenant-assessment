import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  let organization = {};
  let user = {};

  try {
    organization = JSON.parse(
      localStorage.getItem("organization") || "{}"
    );

    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error("Local storage error:", error);
  }

  const organizationName =
    organization.name ||
    organization.organizationName ||
    user.organizationName ||
    "Organization";

  const organizationId =
    organization.organizationId ||
    user.organizationId ||
    "N/A";

  const userName = user.name || "Admin";
  const role = user.role || "admin";

  const databaseName =
    organization.databaseName ||
    organization.database_name ||
    user.databaseName ||
    "N/A";

  const tenantId =
    user.tenantId ||
    user.tenant_id ||
    organization.tenantId ||
    organization.tenant_id;

  const [subscription, setSubscription] = useState(null);

  // Added: products state for dashboard count
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!tenantId) {
      console.warn("Tenant ID not available for subscription lookup");
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/auth/subscription?tenantId=${tenantId}`
      )
      .then((response) => {
        setSubscription(response.data.subscription);
      })
      .catch((error) => {
        console.error("Subscription error:", error);
      });
  }, [tenantId]);

  // Added: load products from the organization's tenant database
  useEffect(() => {
    if (!databaseName || databaseName === "N/A") {
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .get(
        `http://localhost:5000/api/products?databaseName=${encodeURIComponent(
          databaseName
        )}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      )
      .then((response) => {
        const productData =
          response.data?.products || response.data || [];

        setProducts(
          Array.isArray(productData) ? productData : []
        );
      })
      .catch((error) => {
        console.error("Products lookup error:", error);
        setProducts([]);
      });
  }, [databaseName]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">M</div>

          <div>
            <div className="sidebar-brand-name">
              MultiTenant
            </div>

            <div className="sidebar-brand-subtitle">
              Organization Platform
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="sidebar-link active"
          >
            <span>▦</span>
            Dashboard
          </Link>

          <Link
            to="/products"
            className="sidebar-link"
          >
            <span>📦</span>
            Products
          </Link>

          <Link
            to="/employees"
            className="sidebar-link"
          >
            <span>👥</span>
            Employees & Roles
          </Link>

          <Link
            to="/orders"
            className="sidebar-link"
          >
            <span>🛒</span>
            Orders
          </Link>

          <Link
            to="/tracking"
            className="sidebar-link"
          >
            <span>📍</span>
            Customer Tracking
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="tenant-mini-card">
            <div className="tenant-mini-icon">
              {organizationName.charAt(0).toUpperCase()}
            </div>

            <div className="tenant-mini-info">
              <strong>{organizationName}</strong>
              <span>{organizationId}</span>
            </div>
          </div>

          <Link
            to="/signin"
            className="logout-link"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("organization");
            }}
          >
            <span>↪</span>
            Sign Out
          </Link>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* TOP BAR */}
        <header className="dashboard-topbar">

          <div>
            <p className="topbar-label">
              Organization Workspace
            </p>

            <h1>Dashboard</h1>
          </div>

          <div className="topbar-user">

            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="topbar-user-info">
              <strong>{userName}</strong>
              <span>{role}</span>
            </div>

          </div>

        </header>

        {/* WELCOME */}
        <section className="welcome-card">

          <div>
            <span className="welcome-badge">
              ● Workspace Active
            </span>

            <h2>
              Welcome back, {userName}
            </h2>

            <p>
              Manage your organization, products, employees
              and customer orders from one workspace.
            </p>
          </div>

          <div className="welcome-org">

            <div className="org-avatar">
              {organizationName.charAt(0).toUpperCase()}
            </div>

            <div>
              <span>Organization</span>
              <strong>{organizationName}</strong>
              <small>{organizationId}</small>
            </div>

          </div>

        </section>

        {/* STATS */}
        <section className="stats-grid">

          <div className="dashboard-stat-card">

            <div className="stat-icon purple">
              📦
            </div>

            <div>
              <span>Products</span>

              {/* Database-backed product count */}
              <strong>{products.length}</strong>

              <small>Manage inventory</small>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon blue">
              🛒
            </div>

            <div>
              <span>Orders</span>
              <strong>0</strong>
              <small>Customer orders</small>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon green">
              👥
            </div>

            <div>
              <span>Employees</span>
              <strong>1</strong>
              <small>Organization team</small>
            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon orange">
              🔐
            </div>

            <div>
              <span>Your Role</span>

              <strong className="role-stat">
                {role}
              </strong>

              <small>Access level</small>
            </div>

          </div>

        </section>

        {/* ORGANIZATION + SUBSCRIPTION */}
        <section className="content-grid">

          {/* ORGANIZATION DETAILS */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-label">
                  ORGANIZATION
                </span>

                <h3>Organization Details</h3>
              </div>

              <div className="card-header-icon">
                🏢
              </div>

            </div>

            <div className="details-list">

              <div className="detail-row">
                <span>Organization Name</span>
                <strong>{organizationName}</strong>
              </div>

              <div className="detail-row">
                <span>Organization ID</span>
                <strong>{organizationId}</strong>
              </div>

              <div className="detail-row">
                <span>Database</span>
                <strong>{databaseName}</strong>
              </div>

              <div className="detail-row">
                <span>Current User</span>
                <strong>{userName}</strong>
              </div>

              <div className="detail-row">
                <span>Role</span>

                <strong className="role-badge">
                  {role}
                </strong>

              </div>

            </div>

          </div>

          {/* SUBSCRIPTION */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-label">
                  SUBSCRIPTION
                </span>

                <h3>Plan & Trial</h3>
              </div>

              <div className="card-header-icon">
                💳
              </div>

            </div>

            {subscription ? (

              <div className="details-list">

                <div className="detail-row">
                  <span>Plan</span>

                  <strong>
                    {subscription.plan}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Status</span>

                  <strong className="role-badge">
                    {subscription.status}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Trial Start</span>

                  <strong>
                    {formatDate(subscription.trial_start)}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Trial End</span>

                  <strong>
                    {formatDate(subscription.trial_end)}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Subscription Created</span>

                  <strong>
                    {formatDate(subscription.created_at)}
                  </strong>
                </div>

              </div>

            ) : (

              <div style={{ padding: "20px 0" }}>
                <p style={{ margin: 0 }}>
                  Subscription information unavailable.
                </p>
              </div>

            )}

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <span className="card-label">
                QUICK ACTIONS
              </span>

              <h3>Manage Workspace</h3>
            </div>

            <div className="card-header-icon">
              ⚡
            </div>

          </div>

          <div className="quick-actions">

            <Link
              to="/products"
              className="quick-action"
            >

              <div className="quick-action-icon purple-bg">
                📦
              </div>

              <div>
                <strong>Manage Products</strong>

                <span>
                  Add, edit and delete products
                </span>
              </div>

              <b>→</b>

            </Link>

            <Link
              to="/employees"
              className="quick-action"
            >

              <div className="quick-action-icon blue-bg">
                👥
              </div>

              <div>
                <strong>Manage Employees</strong>

                <span>
                  Add employees and assign roles
                </span>
              </div>

              <b>→</b>

            </Link>

            <Link
              to="/orders"
              className="quick-action"
            >

              <div className="quick-action-icon green-bg">
                🛒
              </div>

              <div>
                <strong>Manage Orders</strong>

                <span>
                  View and update customer orders
                </span>
              </div>

              <b>→</b>

            </Link>

            <Link
              to="/tracking"
              className="quick-action"
            >

              <div className="quick-action-icon orange-bg">
                📍
              </div>

              <div>
                <strong>Order Tracking</strong>

                <span>
                  Track customer purchases
                </span>
              </div>

              <b>→</b>

            </Link>

          </div>

        </section>

        {/* ROLE ACCESS */}
        <section className="dashboard-card role-access-card">

          <div className="card-header">

            <div>
              <span className="card-label">
                ROLE BASED ACCESS
              </span>

              <h3>Access & Permissions</h3>
            </div>

            <span className="secure-badge">
              🔒 Secure
            </span>

          </div>

          <div className="permission-grid">

            <div className="permission-item">

              <div className="permission-icon inventory-icon">
                📦
              </div>

              <div>
                <strong>Inventory Manager</strong>

                <p>
                  Product CRUD + Order read access
                </p>
              </div>

            </div>

            <div className="permission-item">

              <div className="permission-icon account-icon">
                💼
              </div>

              <div>
                <strong>Account Manager</strong>

                <p>
                  Product read + Order read/update access
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">

          <span>
            © 2026 MultiTenant Organization Platform
          </span>

          <span>
            Secure • Multi-Tenant • Role Based
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;