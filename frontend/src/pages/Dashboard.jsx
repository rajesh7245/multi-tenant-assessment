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

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >
      <h1>Organization Dashboard</h1>

      <h2>
        Welcome, {user.name || "Admin"}
      </h2>

      <div
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          marginTop: "20px"
        }}
      >
        <h3>Organization Details</h3>

        <p>
          <strong>Organization:</strong>{" "}
          {organization.name ||
            organization.organizationName ||
            "Organization"}
        </p>

        <p>
          <strong>Organization ID:</strong>{" "}
          {organization.organizationId || "N/A"}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user.role || "admin"}
        </p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Modules</h3>

        <button style={{ margin: "5px", padding: "10px" }}>
          Products
        </button>

        <button style={{ margin: "5px", padding: "10px" }}>
          Employees & Roles
        </button>

        <button style={{ margin: "5px", padding: "10px" }}>
          Orders
        </button>

        <button style={{ margin: "5px", padding: "10px" }}>
          Customer Order Tracking
        </button>
      </div>
    </div>
  );
}

export default Dashboard;