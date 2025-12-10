import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./app/Home";
import RequestForm from "./app/request/page";
import AdminPanel from "./app/admin/page";
import AdminLogin from "./app/admin/login";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<RequestForm />} />
        <Route path="/dashboard" element={<AdminPanel />} />
        <Route path="/login" element={<AdminLogin />} />
      </Routes>
    </div>
  );
}

export default App;
