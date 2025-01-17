import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<UserPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
