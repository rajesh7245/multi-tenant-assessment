import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function CustomerHome() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedCustomer = JSON.parse(
      localStorage.getItem("customer") || "{}"
    );

    setCustomer(storedCustomer);
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/organizations"
      );

      setOrganizations(response.data.organizations || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load organizations"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("customerUser");
    localStorage.removeItem("selectedOrganization");

    setCustomer({});

    navigate("/");
  };

  const openOrganization = (organization) => {
    localStorage.setItem(
      "selectedOrganization",
      JSON.stringify(organization)
    );

    navigate(
      `/customer-store?organizationId=${encodeURIComponent(
        organization.organization_id
      )}`
    );
  };

  const filteredOrganizations = organizations.filter(
    (organization) =>
      organization.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      organization.organization_id
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8f9ff 0%, #f4f6fb 100%)",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        color: "#172033"
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "rgba(255,255,255,0.97)",
          borderBottom: "1px solid #e8eaf0",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#172033"
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: "800"
              }}
            >
              MultiTenant
              <span style={{ color: "#5b4bdb" }}>
                Market
              </span>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#73798a",
                marginTop: "3px"
              }}
            >
              One marketplace. Multiple organizations.
            </div>
          </Link>

          {/* TOP RIGHT NAVIGATION */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "flex-end"
            }}
          >
            {customer?.id ? (
              <>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginRight: "5px"
                  }}
                >
                  Hi, {customer.name}
                </span>

                <Link
                  to="/tracking"
                  style={{
                    textDecoration: "none",
                    color: "#303648",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "9px 12px"
                  }}
                >
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "9px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {/* CUSTOMER SIGN IN */}

                <Link
                  to="/customer-signin"
                  style={{
                    textDecoration: "none",
                    color: "#303648",
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "9px 12px"
                  }}
                >
                  Customer Sign In
                </Link>

                {/* CUSTOMER SIGN UP */}

                <Link
                  to="/customer-signup"
                  style={{
                    textDecoration: "none",
                    background: "#5b4bdb",
                    color: "#fff",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  Create Account
                </Link>

                {/* ORGANIZATION LOGIN */}

                <Link
                  to="/signin"
                  style={{
                    textDecoration: "none",
                    color: "#5b4bdb",
                    border: "1px solid #5b4bdb",
                    padding: "9px 15px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    background: "#fff"
                  }}
                >
                  Organization Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "65px 24px 45px"
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #5b4bdb 0%, #7567e8 100%)",
            borderRadius: "24px",
            padding: "60px 45px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 20px 50px rgba(91,75,219,0.22)"
          }}
        >
          <div
            style={{
              maxWidth: "680px",
              position: "relative",
              zIndex: 2
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "7px 12px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.15)",
                fontSize: "13px",
                marginBottom: "18px"
              }}
            >
              🛍️ Multi-Organization Marketplace
            </div>

            <h1
              style={{
                fontSize: "48px",
                lineHeight: "1.1",
                margin: "0 0 18px",
                fontWeight: "800"
              }}
            >
              Discover products from
              organizations you trust.
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                margin: "0 0 28px",
                color: "rgba(255,255,255,0.88)"
              }}
            >
              Explore multiple organizations,
              discover their products, place orders,
              and track everything from one customer
              account.
            </p>

            <a
              href="#organizations"
              style={{
                display: "inline-block",
                padding: "13px 22px",
                background: "#fff",
                color: "#5b4bdb",
                borderRadius: "9px",
                textDecoration: "none",
                fontWeight: "700"
              }}
            >
              Browse Organizations ↓
            </a>
          </div>

          <div
            style={{
              position: "absolute",
              right: "-70px",
              bottom: "-100px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)"
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "100px",
              top: "-80px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)"
            }}
          />
        </div>
      </section>

      {/* ORGANIZATIONS */}

      <main
        id="organizations"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 24px 70px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "20px",
            marginBottom: "22px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <div
              style={{
                color: "#5b4bdb",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              Explore
            </div>

            <h2
              style={{
                fontSize: "30px",
                margin: "6px 0"
              }}
            >
              Browse Organizations
            </h2>

            <p
              style={{
                margin: 0,
                color: "#747b8c"
              }}
            >
              Choose an organization to explore its
              products.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "270px",
              padding: "12px 15px",
              border: "1px solid #dfe2ea",
              borderRadius: "9px",
              outline: "none",
              fontSize: "14px",
              background: "#fff"
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "15px",
              background: "#fff1f1",
              color: "#c62828",
              borderRadius: "9px",
              marginBottom: "20px"
            }}
          >
            {error}
          </div>
        )}

        {!error &&
          filteredOrganizations.length === 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "40px",
                textAlign: "center",
                border: "1px solid #e9ebf2"
              }}
            >
              <h3>No organizations found</h3>

              <p style={{ color: "#777" }}>
                Try a different organization name or ID.
              </p>
            </div>
          )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px"
          }}
        >
          {filteredOrganizations.map(
            (organization) => (
              <div
                key={organization.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e8eaf0",
                  borderRadius: "16px",
                  padding: "25px",
                  boxShadow:
                    "0 8px 25px rgba(30,35,60,0.05)"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#eeecff",
                    color: "#5b4bdb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "21px",
                    marginBottom: "18px"
                  }}
                >
                  🏢
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "20px"
                  }}
                >
                  {organization.name}
                </h3>

                <p
                  style={{
                    color: "#73798a",
                    fontSize: "14px",
                    marginBottom: "20px"
                  }}
                >
                  Organization ID
                </p>

                <div
                  style={{
                    background: "#f7f7fa",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    marginBottom: "18px",
                    fontFamily: "monospace"
                  }}
                >
                  {organization.organization_id}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openOrganization(organization)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "9px",
                    background: "#5b4bdb",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "700"
                  }}
                >
                  Visit Organization →
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* FOOTER */}

      <footer
        style={{
          background: "#171a27",
          color: "#fff",
          padding: "30px 24px"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <strong>MultiTenantMarket</strong>

            <div
              style={{
                color: "#9ca1b1",
                fontSize: "13px",
                marginTop: "5px"
              }}
            >
              A multi-tenant product marketplace.
            </div>
          </div>

          <Link
            to="/signin"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px"
            }}
          >
            Organization Login →
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default CustomerHome;
