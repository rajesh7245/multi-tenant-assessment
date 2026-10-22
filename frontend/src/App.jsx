import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>Multi-Tenant Organization System</h1>

      <p>
        <Link to="/signup">Organization Signup</Link>
      </p>

      <p>
        <Link to="/signin">Organization Signin</Link>
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;