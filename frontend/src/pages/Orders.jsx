import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const databaseName =
    user.databaseName || organization.databaseName;

  const API_URL = "http://localhost:5000/api/orders";

  async function loadOrders() {
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
        `${API_URL}?databaseName=${encodeURIComponent(databaseName)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            databaseName,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update order"
        );
      }

      setMessage("Order status updated successfully.");

      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>

          <div>
            <strong>MultiTenant</strong>
            <span>Organization Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">▦ Dashboard</Link>

          <Link to="/products">
            📦 Products
          </Link>

          <Link to="/employees">
            👥 Employees & Roles
          </Link>

          <Link to="/orders" className="active">
            🛒 Orders
          </Link>

          <Link to="/tracking">
            📍 Customer Tracking
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {(user.name || "A")
                .charAt(0)
                .toUpperCase()}
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

      <main className="main-content">
        <div className="top-header">
          <div>
            <p className="eyebrow">ORDER MANAGEMENT</p>

            <h1>Orders</h1>

            <p className="header-description">
              View and manage customer orders from your organization.
            </p>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {(user.name || "A")
                .charAt(0)
                .toUpperCase()}
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

        <section className="products-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">CUSTOMER ORDERS</p>
              <h2>Orders</h2>
            </div>

            <div className="product-count">
              {orders.length} Orders
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <h3>Loading orders...</h3>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>

              <h3>No orders yet</h3>

              <p>
                Customer orders will appear here once they are placed.
              </p>
            </div>
          ) : (
            <div className="product-list">
              {orders.map((order) => (
                <div
                  className="product-row"
                  key={order.id}
                >
                  <div className="product-info">
                    <div className="product-icon">
                      🛒
                    </div>

                    <div>
                      <h3>
                        Order #{order.id}
                      </h3>

                      <p>
                        {order.customer_name}
                      </p>

                      <p>
                        {order.customer_email}
                      </p>

                      <p>
                        {order.address}
                      </p>
                    </div>
                  </div>

                  <div className="product-meta">
                    <div>
                      <span>Total</span>

                      <strong>
                        ₹
                        {Number(
                          order.total_amount
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>

                      <strong>
                        {order.status}
                      </strong>
                    </div>

                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateStatus(
                          order.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Orders;