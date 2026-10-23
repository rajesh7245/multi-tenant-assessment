import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CustomerPayment() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const planId = params.get("planId");

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);

  const customer = JSON.parse(
    localStorage.getItem("customer") || "{}"
  );

  const handlePayment = async () => {
    if (!customer?.id) {
      alert("Please sign in as a customer first.");
      navigate("/customer-signin");
      return;
    }

    if (!planId) {
      alert("Subscription plan was not selected.");
      navigate("/");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/customers/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerId: customer.id,
            planId: Number(planId)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Payment failed"
        );
      }

      // Save updated subscription details
      // in browser storage.
      localStorage.setItem(
        "customer",
        JSON.stringify(data.customer)
      );

      alert(
        "Payment successful! Your Premium subscription is now active."
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Subscription payment error:",
        error
      );

      alert(
        error.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

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
          background: "#fff",
          borderBottom: "1px solid #e8eaf0"
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "22px",
              fontWeight: "800",
              color: "#172033"
            }}
          >
            MultiTenant
            <span style={{ color: "#5b4bdb" }}>
              Market
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              border: "1px solid #ddd",
              background: "#fff",
              padding: "9px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Back to Marketplace
          </button>
        </div>
      </header>

      {/* PAYMENT */}

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "55px 24px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px"
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
            Premium Subscription
          </div>

          <h1
            style={{
              fontSize: "38px",
              margin: "8px 0 12px"
            }}
          >
            Complete Your Payment
          </h1>

          <p
            style={{
              color: "#73798a",
              margin: 0
            }}
          >
            Start your 7-day Premium trial.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px"
          }}
        >
          {/* PLAN SUMMARY */}

          <div
            style={{
              background: "#fff",
              border: "2px solid #5b4bdb",
              borderRadius: "16px",
              padding: "30px",
              boxShadow:
                "0 10px 30px rgba(91,75,219,0.10)"
            }}
          >
            <div
              style={{
                color: "#5b4bdb",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "1px"
              }}
            >
              SELECTED PLAN
            </div>

            <h2
              style={{
                fontSize: "28px",
                margin: "10px 0"
              }}
            >
              Premium
            </h2>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "15px"
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

            <div
              style={{
                padding: "12px",
                background: "#fff8e6",
                color: "#8a6200",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "20px"
              }}
            >
              🎁 7-day free trial included
            </div>

            <ul
              style={{
                paddingLeft: "20px",
                lineHeight: "2",
                color: "#4d5363"
              }}
            >
              <li>Free Delivery</li>
              <li>Priority Processing</li>
              <li>Order Tracking</li>
              <li>Premium Support</li>
            </ul>
          </div>

          {/* PAYMENT FORM */}

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "16px",
              padding: "30px",
              boxShadow:
                "0 8px 25px rgba(30,35,60,0.05)"
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "25px"
              }}
            >
              Payment Details
            </h2>

            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px"
              }}
            >
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #dfe2ea",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "22px",
                background: "#fff"
              }}
            >
              <option value="UPI">UPI</option>
              <option value="Card">
                Credit / Debit Card
              </option>
              <option value="Net Banking">
                Net Banking
              </option>
            </select>

            <div
              style={{
                background: "#f7f7fb",
                padding: "15px",
                borderRadius: "9px",
                marginBottom: "22px",
                fontSize: "14px",
                color: "#606678"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px"
                }}
              >
                <span>Premium Plan</span>
                <strong>₹199</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>Trial Period</span>
                <strong>7 Days Free</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={processing}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "9px",
                background: processing
                  ? "#aaa"
                  : "#5b4bdb",
                color: "#fff",
                cursor: processing
                  ? "not-allowed"
                  : "pointer",
                fontSize: "15px",
                fontWeight: "700"
              }}
            >
              {processing
                ? "Processing Payment..."
                : `Pay ₹199 with ${paymentMethod}`}
            </button>

            <p
              style={{
                textAlign: "center",
                color: "#8a8f9d",
                fontSize: "12px",
                marginTop: "15px",
                marginBottom: 0
              }}
            >
              Payment gateway simulation for assessment
              purposes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerPayment;
