import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function CustomerSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/customers/signup",
        form
      );

      localStorage.setItem(
        "customerToken",
        response.data.token
      );

      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.customer)
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Customer signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eef0ff 100%)",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          minHeight: "600px",
          background: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow:
            "0 25px 70px rgba(40,35,100,0.12)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr"
        }}
      >
        {/* LEFT SIDE */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #5b4bdb 0%, #7567e8 100%)",
            color: "#fff",
            padding: "55px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "800",
              marginBottom: "10px"
            }}
          >
            MultiTenant
            <span style={{ color: "#ddd8ff" }}>
              Market
            </span>
          </div>

          <div
            style={{
              fontSize: "13px",
              opacity: 0.8,
              marginBottom: "55px"
            }}
          >
            One marketplace. Multiple organizations.
          </div>

          <div
            style={{
              fontSize: "46px",
              marginBottom: "20px"
            }}
          >
            ✨
          </div>

          <h1
            style={{
              fontSize: "38px",
              lineHeight: "1.15",
              margin: "0 0 18px"
            }}
          >
            Join our marketplace.
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.86)",
              maxWidth: "380px"
            }}
          >
            Create one customer account and
            discover products from multiple
            organizations.
          </p>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "14px"
            }}
          >
            <div>✓ One account for the marketplace</div>
            <div>✓ Shop from different organizations</div>
            <div>✓ Track your orders in one place</div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          style={{
            padding: "55px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "30px",
                color: "#172033"
              }}
            >
              Create Customer Account
            </h2>

            <p
              style={{
                margin: 0,
                color: "#73798a",
                fontSize: "14px"
              }}
            >
              Join the marketplace in a few seconds.
            </p>
          </div>

          {message && (
            <div
              style={{
                background: "#edf9f1",
                border: "1px solid #c9efd6",
                color: "#187a3d",
                padding: "12px 14px",
                borderRadius: "9px",
                marginBottom: "20px",
                fontSize: "14px"
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fff1f1",
                border: "1px solid #ffd2d2",
                color: "#c62828",
                padding: "12px 14px",
                borderRadius: "9px",
                marginBottom: "20px",
                fontSize: "14px"
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px"
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "13px 14px",
                border: "1px solid #dfe2ea",
                borderRadius: "9px",
                boxSizing: "border-box",
                marginBottom: "18px",
                fontSize: "14px",
                outline: "none"
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px"
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "13px 14px",
                border: "1px solid #dfe2ea",
                borderRadius: "9px",
                boxSizing: "border-box",
                marginBottom: "18px",
                fontSize: "14px",
                outline: "none"
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px"
              }}
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "13px 14px",
                border: "1px solid #dfe2ea",
                borderRadius: "9px",
                boxSizing: "border-box",
                marginBottom: "25px",
                fontSize: "14px",
                outline: "none"
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "9px",
                background: loading
                  ? "#999"
                  : "#5b4bdb",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {loading
                ? "Creating Account..."
                : "Create Customer Account"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "25px",
              fontSize: "14px",
              color: "#73798a"
            }}
          >
            Already have an account?{" "}
            <Link
              to="/customer-signin"
              style={{
                color: "#5b4bdb",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Sign in
            </Link>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "18px"
            }}
          >
            <Link
              to="/"
              style={{
                color: "#73798a",
                textDecoration: "none",
                fontSize: "13px"
              }}
            >
              ← Back to marketplace
            </Link>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "1px solid #eee"
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#999"
              }}
            >
              Are you an organization?
            </span>{" "}
            <Link
              to="/signin"
              style={{
                fontSize: "12px",
                color: "#5b4bdb",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Organization Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSignup;