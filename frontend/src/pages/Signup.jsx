import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationId: "",
    organizationName: "",
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        form
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Signup failed"
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
      <main className="auth-main">

        {/* LEFT PANEL */}
        <section className="auth-brand-panel">

          <div className="auth-panel-content">

            <div className="pill">
              <span className="live-dot"></span>
              MULTI-TENANT PLATFORM
            </div>

            <h1>
              Build your organization
              <br />
              smarter.
            </h1>

            <p>
              Create your organization and get a dedicated
              workspace for managing products, employees,
              roles and customer orders.
            </p>

            <div className="side-points">

              <div>
                <span>✓</span>
                Dedicated organization database
              </div>

              <div>
                <span>✓</span>
                Secure role-based access
              </div>

              <div>
                <span>✓</span>
                Product and order management
              </div>

              <div>
                <span>✓</span>
                Built for growing teams
              </div>

            </div>

          </div>

        </section>

        {/* FORM */}
        <section className="auth-card-wrap">

          <div className="auth-card">

            <div className="auth-heading">

              <span className="section-eyebrow">
                GET STARTED
              </span>

              <h2>
                Create your organization
              </h2>

              <p>
                Set up your organization account in a few simple steps.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {message && (
                <div className="alert success">
                  {message}
                </div>
              )}

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
                <span>Organization Name</span>

                <input
                  name="organizationName"
                  placeholder="Your company name"
                  value={form.organizationName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Admin Name</span>

                <input
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
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
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
              >
                Create Organization →
              </button>

              <p className="auth-switch">
                Already have an account?{" "}
                <Link to="/signin">
                  Sign in
                </Link>
              </p>

            </form>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Signup;