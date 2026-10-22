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
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h1>Organization Signup</h1>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          name="organizationId"
          placeholder="Organization ID"
          value={form.organizationId}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          name="organizationName"
          placeholder="Organization Name"
          value={form.organizationName}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          name="name"
          placeholder="Admin Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <br /><br />

        <button type="submit">
          Create Organization
        </button>
      </form>

      <br />

      <Link to="/signin">
        Already have an account? Sign in
      </Link>
    </div>
  );
}

export default Signup;