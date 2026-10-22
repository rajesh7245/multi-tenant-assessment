import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function CustomerStore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const organizationId = searchParams.get("organizationId");

  const [organization, setOrganization] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedOrganization = JSON.parse(
      localStorage.getItem("selectedOrganization") || "{}"
    );

    setOrganization(storedOrganization);

    // Save selected organization for customer order and tracking pages
    localStorage.setItem(
      "organization",
      JSON.stringify(storedOrganization)
    );

    if (!storedOrganization.database_name) {
      setError("Organization information is unavailable");
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/products?databaseName=${encodeURIComponent(
          storedOrganization.database_name
        )}`
      )
      .then((response) => {
        setProducts(response.data.products || []);
      })
      .catch((err) => {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load products"
        );
      });
  }, [organizationId]);

  const buyProduct = (product) => {
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    navigate(
      `/customer-order?productId=${product.id}`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial"
      }}
    >
      <header
        style={{
          background: "#fff",
          padding: "18px 40px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {organization.name || "Organization Store"}
          </h2>

          <small>
            {organization.organization_id ||
              organizationId}
          </small>
        </div>

        <Link to="/">
          ← Organizations
        </Link>
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 20px"
        }}
      >
        <section
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "14px",
            marginBottom: "30px"
          }}
        >
          <h1>{organization.name}</h1>

          <p>
            Organization ID:{" "}
            <strong>
              {organization.organization_id}
            </strong>
          </p>

          <p>
            Browse products available from this organization.
          </p>
        </section>

        <h2>Products</h2>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!error && products.length === 0 && (
          <p>No products available.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.06)"
              }}
            >
              <h3>{product.name}</h3>

              <p>
                {product.description ||
                  "No description available"}
              </p>

              <h3>
                ₹
                {Number(product.price).toLocaleString(
                  "en-IN"
                )}
              </h3>

              <p>
                Stock: {product.quantity}
              </p>

              <button
                disabled={Number(product.quantity) <= 0}
                onClick={() => buyProduct(product)}
                style={{
                  width: "100%",
                  padding: "11px",
                  border: "none",
                  borderRadius: "7px",
                  background:
                    Number(product.quantity) <= 0
                      ? "#aaa"
                      : "#5b4bdb",
                  color: "#fff",
                  cursor:
                    Number(product.quantity) <= 0
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "15px"
                }}
              >
                {Number(product.quantity) <= 0
                  ? "Out of Stock"
                  : "Buy Product"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default CustomerStore;