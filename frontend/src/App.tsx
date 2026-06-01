import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import DashboardPage from "./pages/DashboardPage";

function TopNav() {
  const location = useLocation();
  const [latestSessionId, setLatestSessionId] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("latestSessionId") || "";
    setLatestSessionId(id);
  }, [location.pathname]);

  const item = (to: string, label: string) => {
    const active = location.pathname === to || (to.startsWith("/dashboard") && location.pathname.startsWith("/dashboard"));
    return (
      <Link to={to} className={`px-3 py-1.5 rounded-lg text-sm ${active ? "bg-[#2df7c4] text-black" : "text-slate-200 hover:bg-white/10"}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="sticky top-0 z-30 px-4 pt-4">
      <nav className="max-w-6xl mx-auto glass rounded-xl px-3 py-2 flex items-center justify-between">
        <Link to="/" className="font-semibold">InterviewOS</Link>
        <div className="flex items-center gap-2">
          {item("/", "Home")}
          {item("/interview", "Interview")}
          {latestSessionId ? item(`/dashboard/${latestSessionId}`, "Dashboard") : <span className="px-3 py-1.5 rounded-lg text-sm text-slate-500">Dashboard</span>}
        </div>
      </nav>
    </div>
  );
}

function DashboardIndex() {
  const latestSessionId = localStorage.getItem("latestSessionId") || "";
  if (latestSessionId) return <Navigate to={`/dashboard/${latestSessionId}`} replace />;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">No Dashboard Yet</h1>
        <p className="text-slate-300 mt-2">Start an interview first, then your analytics dashboard will appear here automatically.</p>
        <Link to="/interview" className="inline-block mt-4 cta-button">Go To Interview</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/dashboard" element={<DashboardIndex />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
