import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function CustomerOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("productId");

  const [customer, setCustomer] = useState({});
  const [organization, setOrganization] = useState({});
  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [address, setAddress] = useState({
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState(
    "Cash on Delivery"
  );

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const storedCustomer = JSON.parse(
        localStorage.getItem("customer") || "{}"
      );

      const storedOrganization = JSON.parse(
        localStorage.getItem("selectedOrganization") ||
          localStorage.getItem("organization") ||
          "{}"
      );

      setCustomer(storedCustomer);
      setOrganization(storedOrganization);
    } catch (err) {
      console.error("Local storage error:", err);
    }
  }, []);

  useEffect(() => {
    const databaseName =
      organization.database_name ||
      organization.databaseName;

    if (!databaseName || !productId) {
      setLoading(false);
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/products?databaseName=${encodeURIComponent(
          databaseName
        )}`
      )
      .then((response) => {
        const products = response.data.products || [];

        const selectedProduct = products.find(
          (item) => String(item.id) === String(productId)
        );

        if (!selectedProduct) {
          setError("Product not found");
        } else {
          setProduct(selectedProduct);
        }
      })
      .catch((err) => {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load product"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [organization, productId]);

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("customerToken");

    const databaseName =
      organization.database_name ||
      organization.databaseName;

    if (!token) {
      navigate("/customer-signin");
      return;
    }

    if (!databaseName) {
      setError(
        "Organization information is unavailable."
      );
      return;
    }

    if (!product) {
      setError("Product not found.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setError("Quantity must be a positive number.");
      return;
    }

    if (Number(quantity) > Number(product.quantity)) {
      setError(
        `Only ${product.quantity} item(s) are available.`
      );
      return;
    }

    if (!address.houseNumber.trim()) {
      setError("Please enter your house / flat number.");
      return;
    }

    if (!address.street.trim()) {
      setError("Please enter your street / area.");
      return;
    }

    if (!address.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!address.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!address.country.trim()) {
      setError("Please enter your country.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    const formattedAddress = [
      `House/Flat: ${address.houseNumber}`,
      `Street/Area: ${address.street}`,
      `City: ${address.city}`,
      `State: ${address.state}`,
      `Country: ${address.country}`,
      `Pincode: ${address.pincode}`,
      `Phone: ${address.phone}`
    ].join(", ");

    try {
      setPlacingOrder(true);

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          databaseName,
          productId: product.id,
          quantity: Number(quantity),
          address: formattedAddress,
          paymentMethod
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(
        `Order #${response.data.order.id} placed successfully!`
      );

      setTimeout(() => {
        navigate("/tracking");
      }, 1200);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("customerToken");
        navigate("/customer-signin");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const totalAmount = product
    ? Number(product.price) * Number(quantity || 0)
    : 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          fontFamily: "Arial"
        }}
      >
        <h2>Loading product...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial",
        color: "#172033"
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h2
            style={{
              margin: 0
            }}
          >
            MultiTenant
            <span style={{ color: "#5b4bdb" }}>
              Market
            </span>
          </h2>

          <small style={{ color: "#777" }}>
            Secure customer checkout
          </small>
        </div>

        <div>
          <Link
            to="/customer-home"
            style={{
              marginRight: "20px",
              textDecoration: "none",
              color: "#5b4bdb",
              fontWeight: "600"
            }}
          >
            Store
          </Link>

          <Link
            to="/tracking"
            style={{
              textDecoration: "none",
              color: "#5b4bdb",
              fontWeight: "600"
            }}
          >
            My Orders
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 20px"
        }}
      >
        <Link
          to={
            organization.organization_id
              ? `/customer-store?organizationId=${encodeURIComponent(
                  organization.organization_id
                )}`
              : "/"
          }
          style={{
            textDecoration: "none",
            color: "#5b4bdb"
          }}
        >
          ← Back to products
        </Link>

        <h1
          style={{
            marginTop: "25px",
            marginBottom: "25px"
          }}
        >
          Place Your Order
        </h1>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {success}
          </div>
        )}

        {product && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 0.8fr) minmax(450px, 1.2fr)",
              gap: "25px",
              alignItems: "start"
            }}
          >
            {/* PRODUCT SUMMARY */}
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.06)"
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: "20px",
                  background: "#ede9fe",
                  color: "#5b4bdb",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                {organization.name ||
                  organization.organizationName ||
                  "Organization"}
              </div>

              <h2
                style={{
                  marginTop: "20px"
                }}
              >
                {product.name}
              </h2>

              <p
                style={{
                  color: "#666",
                  lineHeight: "1.6"
                }}
              >
                {product.description ||
                  "No description available."}
              </p>

              <h2
                style={{
                  color: "#5b4bdb"
                }}
              >
                ₹
                {Number(product.price).toLocaleString(
                  "en-IN"
                )}
              </h2>

              <p>
                Available stock:{" "}
                <strong>{product.quantity}</strong>
              </p>

              <p>
                Customer:{" "}
                <strong>
                  {customer.name || "Customer"}
                </strong>
              </p>

              <p>
                Email:{" "}
                <strong>
                  {customer.email || ""}
                </strong>
              </p>
            </div>

            {/* CHECKOUT FORM */}
            <form
              onSubmit={handlePlaceOrder}
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "16px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.06)"
              }}
            >
              <h2
                style={{
                  marginTop: 0
                }}
              >
                Delivery Details
              </h2>

              {/* QUANTITY */}
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600"
                }}
              >
                Quantity
              </label>

              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "22px",
                  boxSizing: "border-box",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "15px"
                }}
              />

              {/* ADDRESS FORM */}
              <h3
                style={{
                  marginBottom: "15px"
                }}
              >
                Delivery Address
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "15px"
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    House / Flat / Door No.
                  </label>

                  <input
                    type="text"
                    name="houseNumber"
                    value={address.houseNumber}
                    onChange={handleAddressChange}
                    placeholder="12-34"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Street / Area
                  </label>

                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="Main Road"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="Hyderabad"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="Telangana"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    placeholder="500001"
                    maxLength="6"
                    inputMode="numeric"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      boxSizing: "border-box",
                      border:
                        "1px solid #d1d5db",
                      borderRadius: "8px"
                    }}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div
                style={{
                  marginTop: "15px"
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="9876543210"
                  maxLength="10"
                  inputMode="numeric"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    boxSizing: "border-box",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px"
                  }}
                />
              </div>

              {/* PAYMENT */}
              <h3
                style={{
                  marginTop: "25px",
                  marginBottom: "15px"
                }}
              >
                Payment Method
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <label
                  style={{
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "13px",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={
                      paymentMethod ===
                      "Cash on Delivery"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />{" "}
                  Cash on Delivery
                </label>

                <label
                  style={{
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "13px",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={
                      paymentMethod === "UPI"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />{" "}
                  UPI
                </label>

                <label
                  style={{
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "13px",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    checked={
                      paymentMethod === "Card"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />{" "}
                  Card
                </label>
              </div>

              {/* TOTAL */}
              <div
                style={{
                  borderTop:
                    "1px solid #eee",
                  marginTop: "25px",
                  paddingTop: "20px",
                  marginBottom: "20px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: "20px"
                  }}
                >
                  <strong>Total</strong>

                  <strong
                    style={{
                      color: "#5b4bdb"
                    }}
                  >
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "none",
                  borderRadius: "8px",
                  background: placingOrder
                    ? "#aaa"
                    : "#5b4bdb",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: placingOrder
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerOrder;