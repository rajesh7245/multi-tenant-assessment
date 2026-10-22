import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

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
  user.databaseName ||
  organization.databaseName;

  const API_URL = "http://localhost:5000/api/products";

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      if (!databaseName) {
        setError("Organization database information is missing. Please sign in again.");
        return;
      }

      const response = await fetch(
        `${API_URL}?databaseName=${encodeURIComponent(databaseName)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
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

    if (!form.name || !form.price || form.quantity === "") {
      setError("Product name, price and quantity are required.");
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
          description: form.description,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      setMessage("Product created successfully.");

      setForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
      });

      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${productId}?databaseName=${encodeURIComponent(
          databaseName
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setMessage("Product deleted successfully.");

      loadProducts();
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

          <Link to="/products" className="active">
            📦 Products
          </Link>

          <Link to="/employees">👥 Employees & Roles</Link>

          <Link to="/orders">🛒 Orders</Link>

          <Link to="/tracking">📍 Customer Tracking</Link>
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

      <main className="main-content">
        <div className="top-header">
          <div>
            <p className="eyebrow">INVENTORY MANAGEMENT</p>
            <h1>Products</h1>
            <p className="header-description">
              Add, manage and remove products from your organization.
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

        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

        <section className="product-layout">
          <div className="product-form-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">NEW PRODUCT</p>
                <h2>Add Product</h2>
              </div>

              <div className="heading-icon">＋</div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Product Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />

              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
              />

              <div className="form-row">
                <div>
                  <label>Price</label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="primary-button">
                Add Product →
              </button>
            </form>
          </div>

          <div className="products-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">INVENTORY</p>
                <h2>Your Products</h2>
              </div>

              <div className="product-count">
                {products.length} Products
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <h3>Loading products...</h3>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No products yet</h3>
                <p>
                  Add your first product using the form on the left.
                </p>
              </div>
            ) : (
              <div className="product-list">
                {products.map((product) => (
                  <div className="product-row" key={product.id}>
                    <div className="product-info">
                      <div className="product-icon">📦</div>

                      <div>
                        <h3>{product.name}</h3>

                        <p>
                          {product.description ||
                            "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="product-meta">
                      <div>
                        <span>Price</span>
                        <strong>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div>
                        <span>Stock</span>
                        <strong>{product.quantity}</strong>
                      </div>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id)}
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
      </main>
    </div>
  );
}

export default Products;