
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

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // Admin and Account Manager can update orders.
  // Inventory Manager can only read orders.
  const canUpdateOrders =
    user.role === "admin" ||
    user.role === "Account Manager";

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

      if (!token) {
        setError(
          "Staff authentication required. Please sign in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}?databaseName=${encodeURIComponent(databaseName)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

      if (!token) {
        setError(
          "Staff authentication required. Please sign in again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      setMessage(
        "Order status updated successfully."
      );

      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("organization");

    window.location.href = "/signin";
  }

  return (
    <div className="page">

      {/* =========================
          SIDEBAR
          ========================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            M
          </div>

          <div>
            <strong>MultiTenant</strong>
            <small>Organization Platform</small>
          </div>

        </div>

        <nav className="sidebar-nav">

          <Link
            to={
              user.role === "Inventory Manager"
                ? "/inventory-dashboard"
                : user.role === "Account Manager"
                ? "/account-dashboard"
                : "/dashboard"
            }
            className="sidebar-link"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/products"
            className="sidebar-link"
          >
            📦 Products
          </Link>

          {user.role === "admin" && (
            <Link
              to="/employees"
              className="sidebar-link"
            >
              👥 Employees & Roles
            </Link>
          )}

          <Link
            to="/orders"
            className="sidebar-link active"
          >
            🛒 Orders
          </Link>

        </nav>

        <div className="sidebar-user">

          <div className="user-avatar">
            {(user.name || "A")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {user.name || "Admin"}
            </strong>

            <small>
              {user.role || "Admin"}
            </small>
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


      {/* =========================
          MAIN CONTENT
          ========================= */}

      <main className="main-content">

        <div className="top-header">

          <div>

            <p className="eyebrow">
              ORDER MANAGEMENT
            </p>

            <h1>
              Orders
            </h1>

            <p className="header-description">
              View and manage customer orders
              from your organization.
            </p>

          </div>


          <div className="header-user">

            <div className="user-avatar">
              {(user.name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {user.name || "Admin"}
              </strong>

              <span>
                {user.role || "Admin"}
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            SUCCESS MESSAGE
            ========================= */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}


        {/* =========================
            ERROR MESSAGE
            ========================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* =========================
            ORDERS CARD
            ========================= */}

        <section className="products-card">

          <div className="card-heading">

            <div>

              <p className="eyebrow">
                CUSTOMER ORDERS
              </p>

              <h2>
                Orders
              </h2>

            </div>

            <div className="product-count">
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </div>

          </div>


          {/* =========================
              LOADING
              ========================= */}

          {loading ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading orders...
              </h3>

            </div>

          ) : orders.length === 0 ? (

            /* =========================
               NO ORDERS
               ========================= */

            <div className="empty-state">

              <div className="empty-icon">
                🛒
              </div>

              <h3>
                No orders yet
              </h3>

              <p>
                Customer orders will appear
                here once they are placed.
              </p>

            </div>

          ) : (

            /* =========================
               ORDER LIST
               ========================= */

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

                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.total_amount
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Status
                      </span>

                      <strong>
                        {order.status}
                      </strong>

                    </div>


                    {/* =========================
                        STATUS UPDATE
                        ONLY ADMIN / ACCOUNT MANAGER
                        ========================= */}

                    {canUpdateOrders && (

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

                      </select>

                    )}

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
