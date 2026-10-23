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

  const handlePremiumClick = () => {
    navigate("/customer-payment?planId=2");
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

  const isPremium =
    customer?.subscription_plan_id === 2 &&
    customer?.subscription_status !== "free";

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

                <a
                  href="#subscription"
                  style={{
                    textDecoration: "none",
                    color: "#5b4bdb",
                    fontWeight: "700",
                    fontSize: "14px",
                    padding: "9px 12px"
                  }}
                >
                  Subscription
                </a>

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

      {/* CUSTOMER SUBSCRIPTION SECTION */}

      {customer?.id && (
        <section
          id="subscription"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "10px 24px 55px"
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "20px",
              padding: "35px",
              boxShadow:
                "0 8px 30px rgba(30,35,60,0.05)"
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px"
              }}
            >
              <div
                style={{
                  color: "#5b4bdb",
                  fontWeight: "700",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                Customer Membership
              </div>

              <h2
                style={{
                  fontSize: "32px",
                  margin: "7px 0 10px"
                }}
              >
                Choose Your Subscription
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#747b8c"
                }}
              >
                Get additional benefits while shopping
                across the marketplace.
              </p>
            </div>

            {/* CURRENT SUBSCRIPTION */}

            <div
              style={{
                background: "#f7f7fb",
                borderRadius: "12px",
                padding: "15px 18px",
                marginBottom: "28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#73798a",
                    marginBottom: "4px"
                  }}
                >
                  Current Subscription
                </div>

                <strong
                  style={{
                    fontSize: "17px"
                  }}
                >
                  {customer?.subscriptionPlan?.name ||
                    (customer?.subscription_plan_id === 2
                      ? "Premium"
                      : "Free")}
                </strong>
              </div>

              <div
                style={{
                  padding: "7px 12px",
                  borderRadius: "20px",
                  background: isPremium
                    ? "#e8f7ee"
                    : "#eeecff",
                  color: isPremium
                    ? "#218838"
                    : "#5b4bdb",
                  fontSize: "13px",
                  fontWeight: "700"
                }}
              >
                {customer?.subscription_status || "free"}
              </div>
            </div>

            {/* PLANS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "22px"
              }}
            >
              {/* FREE PLAN */}

              <div
                style={{
                  border: "1px solid #e2e4eb",
                  borderRadius: "16px",
                  padding: "28px",
                  background: "#fff"
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#73798a",
                    fontWeight: "700",
                    marginBottom: "8px"
                  }}
                >
                  BASIC
                </div>

                <h3
                  style={{
                    fontSize: "26px",
                    margin: "0 0 8px"
                  }}
                >
                  Free
                </h3>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    marginBottom: "8px"
                  }}
                >
                  ₹0
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#777",
                      fontWeight: "400"
                    }}
                  >
                    /month
                  </span>
                </div>

                <p
                  style={{
                    color: "#73798a",
                    fontSize: "14px"
                  }}
                >
                  Standard marketplace access.
                </p>

                <ul
                  style={{
                    paddingLeft: "20px",
                    color: "#4d5363",
                    lineHeight: "1.9",
                    fontSize: "14px"
                  }}
                >
                  <li>Standard Delivery</li>
                  <li>Order Tracking</li>
                </ul>

                <div
                  style={{
                    marginTop: "22px",
                    padding: "11px",
                    textAlign: "center",
                    background: "#f1f1f5",
                    color: "#777",
                    borderRadius: "8px",
                    fontWeight: "600"
                  }}
                >
                  Current Free Plan
                </div>
              </div>

              {/* PREMIUM PLAN */}

              <div
                style={{
                  border: "2px solid #5b4bdb",
                  borderRadius: "16px",
                  padding: "28px",
                  background:
                    "linear-gradient(180deg, #faf9ff 0%, #fff 100%)",
                  position: "relative",
                  boxShadow:
                    "0 10px 30px rgba(91,75,219,0.10)"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "#5b4bdb",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700"
                  }}
                >
                  POPULAR
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#5b4bdb",
                    fontWeight: "700",
                    marginBottom: "8px"
                  }}
                >
                  PREMIUM
                </div>

                <h3
                  style={{
                    fontSize: "26px",
                    margin: "0 0 8px"
                  }}
                >
                  Premium
                </h3>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    marginBottom: "8px"
                  }}
                >
                  ₹199
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#777",
                      fontWeight: "400"
                    }}
                  >
                    /month
                  </span>
                </div>

                <p
                  style={{
                    color: "#73798a",
                    fontSize: "14px"
                  }}
                >
                  Enjoy premium shopping benefits.
                </p>

                <ul
                  style={{
                    paddingLeft: "20px",
                    color: "#4d5363",
                    lineHeight: "1.9",
                    fontSize: "14px"
                  }}
                >
                  <li>Free Delivery</li>
                  <li>Priority Processing</li>
                  <li>Order Tracking</li>
                  <li>Premium Support</li>
                  <li>7-Day Free Trial</li>
                </ul>

                {isPremium ? (
                  <div
                    style={{
                      marginTop: "22px",
                      padding: "11px",
                      textAlign: "center",
                      background: "#e8f7ee",
                      color: "#218838",
                      borderRadius: "8px",
                      fontWeight: "700"
                    }}
                  >
                    Premium Active
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePremiumClick}
                    style={{
                      width: "100%",
                      marginTop: "22px",
                      padding: "13px",
                      border: "none",
                      borderRadius: "9px",
                      background: "#5b4bdb",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: "700"
                    }}
                  >
                    Choose Premium →
                  </button>
                )}
              </div>
            </div>

            {/* TRIAL INFORMATION */}

            {customer?.subscription_status === "trial" &&
              customer?.trial_end && (
                <div
                  style={{
                    marginTop: "25px",
                    padding: "15px 18px",
                    background: "#fff8e6",
                    color: "#8a6200",
                    borderRadius: "10px",
                    fontSize: "14px"
                  }}
                >
                  🎁 Your free trial is active until{" "}
                  <strong>
                    {new Date(
                      customer.trial_end
                    ).toLocaleDateString()}
                  </strong>
                  .
                </div>
              )}
          </div>
        </section>
      )}

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