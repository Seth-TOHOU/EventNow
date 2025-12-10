import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./app/Home";
import RequestForm from "./app/request/page";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<RequestForm />} />
      </Routes>
    </div>
  );
}

export default App;
