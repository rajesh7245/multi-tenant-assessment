import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function CustomerTracking() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({});
  const [organization, setOrganization] = useState({});
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedCustomer = JSON.parse(
        localStorage.getItem("customer") || "{}"
      );

      // IMPORTANT:
      // CustomerStore uses selectedOrganization
      const storedOrganization = JSON.parse(
        localStorage.getItem("selectedOrganization") || "{}"
      );

      setCustomer(storedCustomer);
      setOrganization(storedOrganization);

    } catch (err) {
      console.error("Storage error:", err);
      setError("Unable to read customer information.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("customerToken");

      if (!token) {
        navigate("/customer-signin");
        return;
      }

      const databaseName =
        organization.database_name ||
        organization.databaseName;

      if (!databaseName) {
        setError(
          "Organization information is unavailable. Please return to the marketplace and select an organization."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/api/orders/customer?databaseName=${encodeURIComponent(
            databaseName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Tracking error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customer");
          navigate("/customer-signin");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      organization.database_name ||
      organization.databaseName
    ) {
      loadOrders();
    } else if (
      Object.keys(organization).length > 0
    ) {
      setLoading(false);
      setError(
        "Organization information is unavailable. Please return to the marketplace and select an organization."
      );
    }
  }, [organization, navigate]);

  const statusSteps = [
    "pending",
    "processing",
    "shipped",
    "delivered"
  ];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(
      String(status || "").toLowerCase()
    );
  };

  const formatStatus = (status) => {
    const value = String(status || "").toLowerCase();

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  const getProductName = (order) => {
    if (
      order.items &&
      order.items.length > 0
    ) {
      return `Product #${order.items[0].product_id}`;
    }

    return "Product";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        color: "#172033"
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "22px 44px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "28px",
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
              fontSize: "13px",
              color: "#777",
              marginTop: "3px"
            }}
          >
            Customer Order Tracking
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "25px"
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#5b4bdb",
              fontWeight: "700"
            }}
          >
            Marketplace
          </Link>

          <Link
            to="/customer-home"
            style={{
              textDecoration: "none",
              color: "#5b4bdb",
              fontWeight: "700"
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: "1050px",
          margin: "55px auto",
          padding: "0 25px"
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "42px",
              margin: "0 0 8px"
            }}
          >
            My Orders
          </h1>

          <p
            style={{
              margin: 0,
              color: "#73798a",
              fontSize: "16px"
            }}
          >
            Welcome back,{" "}
            <strong>
              {customer.name || "Customer"}
            </strong>
            . Track your purchases below.
          </p>

          {organization.name && (
            <div
              style={{
                display: "inline-block",
                marginTop: "18px",
                padding: "8px 14px",
                borderRadius: "20px",
                background: "#eeecff",
                color: "#5b4bdb",
                fontWeight: "700"
              }}
            >
              🏢 {organization.name}
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "55px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.05)"
            }}
          >
            <h2>Loading your orders...</h2>

            <p style={{ color: "#777" }}>
              Please wait while we retrieve your
              purchases.
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              background: "#fff1f1",
              border: "1px solid #ffd2d2",
              color: "#c62828",
              padding: "18px 20px",
              borderRadius: "12px",
              marginBottom: "20px"
            }}
          >
            {error}
          </div>
        )}

        {/* NO ORDERS */}
        {!loading &&
          !error &&
          orders.length === 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                padding: "65px 30px",
                textAlign: "center",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "55px",
                  marginBottom: "15px"
                }}
              >
                📦
              </div>

              <h2>
                No orders yet
              </h2>

              <p
                style={{
                  color: "#777",
                  marginBottom: "25px"
                }}
              >
                You haven't placed any orders yet.
              </p>

              <Link
                to="/customer-home"
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  background: "#5b4bdb",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                Browse Products
              </Link>
            </div>
          )}

        {/* ORDERS */}
        {!loading &&
          !error &&
          orders.map((order) => {
            const currentStep = getStatusIndex(
              order.status
            );

            const firstItem =
              order.items &&
              order.items.length > 0
                ? order.items[0]
                : null;

            return (
              <div
                key={order.id}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "30px",
                  marginBottom: "25px",
                  boxShadow:
                    "0 8px 28px rgba(0,0,0,0.06)"
                }}
              >
                {/* ORDER HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "25px"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#888",
                        marginBottom: "5px"
                      }}
                    >
                      ORDER
                    </div>

                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      #{order.id}
                    </h2>

                    <div
                      style={{
                        marginTop: "6px",
                        color: "#777",
                        fontSize: "14px"
                      }}
                    >
                      {organization.name ||
                        "Organization"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "10px 18px",
                      borderRadius: "25px",
                      background: "#eeecff",
                      color: "#5b4bdb",
                      fontWeight: "700"
                    }}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </div>
                </div>

                {/* PRODUCT + CUSTOMER */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "18px",
                    marginBottom: "28px"
                  }}
                >
                  <div
                    style={{
                      background: "#f8f8fb",
                      padding: "18px",
                      borderRadius: "12px"
                    }}
                  >
                    <div
                      style={{
                        color: "#888",
                        fontSize: "13px",
                        marginBottom: "6px"
                      }}
                    >
                      PRODUCT
                    </div>

                    <strong>
                      {getProductName(order)}
                    </strong>

                    {firstItem && (
                      <div
                        style={{
                          marginTop: "7px",
                          color: "#666"
                        }}
                      >
                        Quantity:{" "}
                        <strong>
                          {firstItem.quantity}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: "#f8f8fb",
                      padding: "18px",
                      borderRadius: "12px"
                    }}
                  >
                    <div
                      style={{
                        color: "#888",
                        fontSize: "13px",
                        marginBottom: "6px"
                      }}
                    >
                      CUSTOMER
                    </div>

                    <strong>
                      {order.customer_name}
                    </strong>

                    <div
                      style={{
                        marginTop: "7px",
                        color: "#666"
                      }}
                    >
                      {order.customer_email}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8f8fb",
                      padding: "18px",
                      borderRadius: "12px"
                    }}
                  >
                    <div
                      style={{
                        color: "#888",
                        fontSize: "13px",
                        marginBottom: "6px"
                      }}
                    >
                      TOTAL
                    </div>

                    <strong
                      style={{
                        color: "#5b4bdb",
                        fontSize: "20px"
                      }}
                    >
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* ORDER DATE */}
                <div
                  style={{
                    marginBottom: "28px",
                    color: "#666",
                    fontSize: "14px"
                  }}
                >
                  Ordered on{" "}
                  <strong>
                    {new Date(
                      order.created_at
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                {/* TRACKING */}
                <div
                  style={{
                    borderTop:
                      "1px solid #eee",
                    paddingTop: "28px"
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "25px"
                    }}
                  >
                    Order Tracking
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, 1fr)",
                      gap: "10px"
                    }}
                  >
                    {statusSteps.map(
                      (step, index) => (
                        <div
                          key={step}
                          style={{
                            textAlign: "center"
                          }}
                        >
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              margin: "0 auto",
                              borderRadius:
                                "50%",
                              background:
                                index <=
                                currentStep
                                  ? "#5b4bdb"
                                  : "#e5e7eb",
                              color:
                                index <=
                                currentStep
                                  ? "#fff"
                                  : "#999",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight: "700"
                            }}
                          >
                            {index <=
                            currentStep
                              ? "✓"
                              : index + 1}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "10px",
                              fontSize:
                                "13px",
                              fontWeight:
                                index <=
                                currentStep
                                  ? "700"
                                  : "400",
                              color:
                                index <=
                                currentStep
                                  ? "#5b4bdb"
                                  : "#888",
                              textTransform:
                                "capitalize"
                            }}
                          >
                            {step}
                          </div>

                          {index < 3 && (
                            <div
                              style={{
                                height: "4px",
                                background:
                                  index <
                                  currentStep
                                    ? "#5b4bdb"
                                    : "#e5e7eb",
                                marginTop:
                                  "-17px",
                                position:
                                  "relative",
                                zIndex: 0
                              }}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* DELIVERY ADDRESS */}
                <div
                  style={{
                    marginTop: "30px",
                    background: "#f8f8fb",
                    padding: "18px",
                    borderRadius: "12px"
                  }}
                >
                  <div
                    style={{
                      color: "#888",
                      fontSize: "13px",
                      marginBottom: "6px"
                    }}
                  >
                    DELIVERY ADDRESS
                  </div>

                  <strong>
                    {order.address}
                  </strong>
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
}

export default CustomerTracking;