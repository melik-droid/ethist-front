import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import JournalPage from "./pages/JournalPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
