import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import FeatureFlags from "./pages/FeatureFlags";
import Groups from "./pages/Groups";
import TargetingRules from "./pages/TargetingRules";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Main pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/feature-flags" element={<FeatureFlags />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/targeting-rules" element={<TargetingRules />} />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/signup" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;