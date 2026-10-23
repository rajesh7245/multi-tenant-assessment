import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationId: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signin",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      const user = response.data.user;

      localStorage.setItem(
        "organization",
        JSON.stringify({
          organizationId: response.data.user.organizationId,
          name: response.data.user.organizationName,
          organizationName: response.data.user.organizationName,
          databaseName: response.data.user.databaseName
        })
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Role-based redirect
      if (response.data.user.role === "admin") {
        navigate("/dashboard");
      } else if (response.data.user.role === "Inventory Manager") {
        navigate("/inventory-dashboard");
      } else if (response.data.user.role === "Account Manager") {
        navigate("/account-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Signin failed"
      );
    }
  };

  return (
    <div className="auth-page">

      {/* TOP BAR */}
      <header className="auth-topbar">

        <Link to="/" className="brand">
          <div className="brand-mark">M</div>

          <div>
            <strong>MultiTenant</strong>
            <small>Organization Platform</small>
          </div>
        </Link>

        <Link to="/" className="back-link">
          ← Back to home
        </Link>

      </header>

      {/* MAIN */}
      <main className="auth-main signin-layout">

        {/* FORM */}
        <section className="auth-card-wrap">

          <div className="auth-card">

            <div className="auth-heading">

              <span className="section-eyebrow">
                WELCOME BACK
              </span>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Access your organization's secure workspace.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="alert error">
                  {error}
                </div>
              )}

              <label className="field">
                <span>Organization ID</span>

                <input
                  name="organizationId"
                  placeholder="e.g. ORG-1001"
                  value={form.organizationId}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Email Address</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
              >
                Sign In →
              </button>

              <p className="auth-switch">
                Don't have an account?{" "}
                <Link to="/signup">
                  Create organization
                </Link>
              </p>

            </form>

          </div>

        </section>

        {/* RIGHT PANEL */}
        <section className="auth-brand-panel">

          <div className="auth-panel-content">

            <div className="pill">
              <span className="live-dot"></span>
              SECURE WORKSPACE
            </div>

            <h1>
              Welcome back.
              <br />
              Your business awaits.
            </h1>

            <p>
              Sign in to manage your products, employees,
              customer orders and organization operations
              from one secure workspace.
            </p>

            <div className="side-points">

              <div>
                <span>✓</span>
                Secure organization access
              </div>

              <div>
                <span>✓</span>
                Role-based permissions
              </div>

              <div>
                <span>✓</span>
                Manage products and inventory
              </div>

              <div>
                <span>✓</span>
                Track and manage customer orders
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Signin;