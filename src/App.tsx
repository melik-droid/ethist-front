import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import ShowRecordsPage from "./pages/ShowRecordsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/show-records" element={<ShowRecordsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
