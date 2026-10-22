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

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "organization",
        JSON.stringify(response.data.organization)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Signin failed"
      );
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h1>Organization Signin</h1>

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
          Sign In
        </button>
      </form>

      <br />

      <Link to="/signup">
        Create organization
      </Link>
    </div>
  );
}

export default Signin;