import { Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Employees from "./pages/Employees";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import CustomerOrder from "./pages/CustomerOrder";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerSignin from "./pages/CustomerSignin";
import CustomerHome from "./pages/CustomerHome";
import CustomerStore from "./pages/CustomerStore";
import CustomerTracking from "./pages/CustomerTracking";
import InventoryDashboard from "./pages/InventoryDashboard";
import AccountDashboard from "./pages/AccountDashboard";
import CustomerPayment from "./pages/CustomerPayment";
import "./App.css";

function LandingPage() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">M</div>

            <div>
              <div className="brand-name">MultiTenant</div>
              <div className="brand-subtitle">Organization Platform</div>
            </div>
          </Link>

          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#roles">Roles</a>
          </nav>

          <div className="nav-actions">
            <Link to="/signin" className="login-link">
              Sign In
            </Link>

            <Link to="/signup" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="status-dot"></span>
                Multi-Tenant Organization Management
              </div>

              <h1>
                Run your organization
                <span> smarter.</span>
              </h1>

              <p className="hero-text">
                A complete platform to manage products, employees, roles,
                orders and customers from one secure workspace.
              </p>

              <div className="hero-buttons">
                <Link to="/signup" className="primary-button">
                  Create Organization
                  <span>→</span>
                </Link>

                <Link to="/signin" className="secondary-button">
                  Sign In
                </Link>
              </div>

              <div className="trust-row">
                <div>
                  <span>✓</span>
                  Secure
                </div>

                <div>
                  <span>✓</span>
                  Multi-Tenant
                </div>

                <div>
                  <span>✓</span>
                  Role Based Access
                </div>
              </div>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="dashboard-wrapper">
              <div className="dashboard-window">
                <div className="window-header">
                  <div className="window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="window-title">
                    Organization Dashboard
                  </div>

                  <div className="online-status">
                    <span></span>
                    Live
                  </div>
                </div>

                <div className="dashboard-body">
                  <div className="dashboard-heading">
                    <div>
                      <p>Welcome back</p>
                      <h3>Business Overview</h3>
                    </div>

                    <div className="date-badge">
                      October 2026
                    </div>
                  </div>

                  <div className="stat-grid">
                    <div className="stat-card">
                      <div className="stat-top">
                        <span className="stat-icon purple">▣</span>
                        <span className="growth">+12%</span>
                      </div>

                      <p>Products</p>
                      <h2>128</h2>
                      <small>Active products</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span className="stat-icon blue">◉</span>
                        <span className="growth">+8%</span>
                      </div>

                      <p>Orders</p>
                      <h2>342</h2>
                      <small>This month</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span className="stat-icon green">♙</span>
                        <span className="growth">+6%</span>
                      </div>

                      <p>Employees</p>
                      <h2>24</h2>
                      <small>Team members</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span className="stat-icon orange">₹</span>
                        <span className="growth">+18%</span>
                      </div>

                      <p>Revenue</p>
                      <h2>₹8.4L</h2>
                      <small>This month</small>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-header">
                      <div>
                        <h4>Orders Overview</h4>
                        <p>Track your organization's activity</p>
                      </div>

                      <span>Last 30 days</span>
                    </div>

                    <div className="chart">
                      <div className="chart-bars">
                        <div
                          className="bar"
                          style={{ height: "35%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "52%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "43%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "70%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "58%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "84%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "67%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "91%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "76%" }}
                        ></div>

                        <div
                          className="bar"
                          style={{ height: "96%" }}
                        ></div>
                      </div>

                      <div className="chart-labels">
                        <span>01</span>
                        <span>05</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25</span>
                        <span>30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-section">
          <div className="stats-container">
            <div>
              <strong>100%</strong>
              <span>Organization isolation</span>
            </div>

            <div>
              <strong>7+</strong>
              <span>Tenant database tables</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Core management areas</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Cloud database access</span>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features-section">
          <div className="section-heading">
            <div className="section-label">POWERFUL FEATURES</div>

            <h2>
              Everything your organization
              <span> needs.</span>
            </h2>

            <p>
              Manage your complete business workflow through a single
              easy-to-use platform.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon purple-bg">🏢</div>

              <h3>Organization Management</h3>

              <p>
                Create and manage isolated organizations with dedicated
                databases for every tenant.
              </p>

              <span className="feature-link">
                Manage organizations →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue-bg">📦</div>

              <h3>Product Management</h3>

              <p>
                Add, edit, delete and manage your organization's products
                and inventory.
              </p>

              <span className="feature-link">
                Manage products →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-icon green-bg">👥</div>

              <h3>Employees & Roles</h3>

              <p>
                Control access using role-based permissions for Inventory
                Managers and Account Managers.
              </p>

              <span className="feature-link">
                Manage team →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange-bg">🛒</div>

              <h3>Order Management</h3>

              <p>
                Create orders, update order status and allow customers to
                track their purchases.
              </p>

              <span className="feature-link">
                Manage orders →
              </span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="how-section">
          <div className="section-heading">
            <div className="section-label">HOW IT WORKS</div>

            <h2>
              Simple setup.
              <span> Powerful results.</span>
            </h2>

            <p>
              Get your organization running in just a few steps.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>

              <div>
                <h3>Create your organization</h3>

                <p>
                  Register your organization with a unique organization ID
                  and name.
                </p>
              </div>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <div className="step-number">02</div>

              <div>
                <h3>Your database is created</h3>

                <p>
                  A dedicated tenant database and required tables are
                  automatically created.
                </p>
              </div>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <div className="step-number">03</div>

              <div>
                <h3>Add your team and products</h3>

                <p>
                  Configure employees, roles, permissions and products for
                  your organization.
                </p>
              </div>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <div className="step-number">04</div>

              <div>
                <h3>Manage orders</h3>

                <p>
                  Process customer orders and track their status from
                  placement to completion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className="roles-section">
          <div className="section-heading">
            <div className="section-label">ROLE BASED ACCESS</div>

            <h2>
              Give everyone the
              <span> right access.</span>
            </h2>

            <p>
              Keep your organization secure with permission-based access.
            </p>
          </div>

          <div className="role-grid">
            <div className="role-card inventory">
              <div className="role-header">
                <div className="role-icon">📦</div>

                <div>
                  <h3>Inventory Manager</h3>
                  <span>Product operations</span>
                </div>
              </div>

              <div className="permission-list">
                <div>✓ Create products</div>
                <div>✓ Update products</div>
                <div>✓ Delete products</div>
                <div>✓ View orders</div>
                <div className="disabled">× Update orders</div>
              </div>
            </div>

            <div className="role-card account">
              <div className="role-header">
                <div className="role-icon">💼</div>

                <div>
                  <h3>Account Manager</h3>
                  <span>Order operations</span>
                </div>
              </div>

              <div className="permission-list">
                <div>✓ View products</div>
                <div>✓ View orders</div>
                <div>✓ Update order status</div>
                <div>✓ Manage customer orders</div>
                <div className="disabled">× Delete products</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-content">
            <div className="section-label">READY TO START?</div>

            <h2>
              Build a smarter
              <span> organization today.</span>
            </h2>

            <p>
              Create your organization and start managing your products,
              employees and orders.
            </p>

            <div className="cta-buttons">
              <Link to="/signup" className="primary-button">
                Create Organization
                <span>→</span>
              </Link>

              <Link to="/signin" className="cta-signin">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <div className="brand-icon">M</div>

              <div>
                <div className="brand-name">MultiTenant</div>

                <div className="brand-subtitle">
                  Organization Platform
                </div>
              </div>
            </Link>

            <p>
              A modern multi-tenant organization management platform.
            </p>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>

            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#roles">Roles</a>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Create Organization</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 MultiTenant Organization Platform</span>

          <span>Secure • Multi-Tenant • Role Based</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/orders" element={<Orders />} />
      <Route
  path="/customer-payment"
  element={<CustomerPayment />}
/>
      <Route
  path="/customer-order"
  element={<CustomerOrder />}
/>
      {/* EMPLOYEES & ROLES */}
      <Route path="/employees" element={<Employees />} />
      <Route path="/customer-home" element={<CustomerHome />} />
      <Route
  path="/customer-signup"
  element={<CustomerSignup />}
/>
<Route
  path="/customer-store"
  element={<CustomerStore />}
/>
<Route
  path="/tracking"
  element={<CustomerTracking />}
/>
<Route path="/inventory-dashboard" element={<InventoryDashboard />} />
<Route path="/account-dashboard" element={<AccountDashboard />} />
<Route
  path="/customer-signin"
  element={<CustomerSignin />}
/>
    </Routes>
  );
}

export default App;