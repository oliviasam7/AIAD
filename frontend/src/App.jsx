import React, { useState } from "react";
import "./styles/global.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InputPanel from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Pricing from "./components/Pricing";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { analyzeContract, readFileAsText } from "./utils/api";
import { apiUseAnalysis } from "./utils/auth";

const workspaceStyle = `
.workspace {
  position: relative; z-index: 1;
  flex: 1; display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; border-top: 1px solid var(--border);
  max-width: 100%;
}
.limit-banner {
  position: relative; z-index: 1;
  background: rgba(240,180,41,0.08); border-bottom: 1px solid rgba(240,180,41,0.25);
  padding: 12px 40px; display: flex; align-items: center; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--gold);
}
.limit-banner button {
  background: var(--gold); color: #000; border: none;
  padding: 6px 18px; font-family: 'Syne', sans-serif; font-size: 11px;
  font-weight: 800; cursor: pointer; letter-spacing: 0.5px;
  clip-path: polygon(6px 0%,100% 0%,100% calc(100% - 6px),calc(100% - 6px) 100%,0% 100%,0% 6px);
}
`;

const PLAN_LIMITS = { free: 3, pro: 50, enterprise: Infinity };

function AppInner() {
  const { user, token, loading } = useAuth();

  const [page, setPage] = useState("home");

  const [tab, setTab]         = useState("text");
  const [text, setText]       = useState("");
  const [file, setFile]       = useState(null);
  const [imgData, setImgData] = useState(null);
  const [focus, setFocus]     = useState(["risks", "financials", "obligations"]);
  const toggleFocus = (id) =>
    setFocus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const [status, setStatus]             = useState("idle");
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");
  const [contractText, setContractText] = useState("");  // ← stores extracted text

  const limit       = PLAN_LIMITS[user?.plan ?? "free"];
  const used        = user?.analysisCount ?? 0;
  const remaining   = Math.max(0, limit - used);
  const limitReached = user && remaining === 0;

  const canGo =
    (tab === "text" ? text.trim().length > 40 : !!file) &&
    focus.length > 0 &&
    status !== "loading" &&
    !limitReached;

  const handleAnalyze = async () => {
    if (!user) { setPage("login"); return; }
    if (limitReached) { setPage("pricing"); return; }

    setStatus("loading"); setError(""); setResult(null); setContractText("");

    try {
      await apiUseAnalysis(token);

      let analysis;
      let extractedText = "";

      if (tab === "text") {
        if (!text.trim() || text.trim().length < 40)
          throw new Error("Please paste at least a few sentences of contract text.");
        extractedText = text;
        analysis = await analyzeContract(text, focus, null);

      } else {
        if (!file) throw new Error("Please upload a file.");

        if (file.type.startsWith("image/")) {
          analysis = await analyzeContract("", focus, imgData);
          extractedText = analysis._contractText || "";
        } else {
          extractedText = await readFileAsText(file);
          analysis = await analyzeContract(extractedText, focus, null);
        }
      }

      setContractText(extractedText);
      setResult(analysis);
      setStatus("done");

    } catch (e) {
      if (e.message === "limit_reached") {
        setPage("pricing");
      } else {
        setError(e.message);
        setStatus("error");
      }
    }
  };

  if (loading) return null;

  if (page === "login") {
    return (
      <>
        <style>{workspaceStyle}</style>
        <div className="app">
          <Navbar onPricing={() => setPage("pricing")} onLogin={() => setPage("login")} setPage={setPage} />
          <Login onSuccess={() => setPage("home")} />
        </div>
      </>
    );
  }

  if (page === "pricing") {
    return (
      <>
        <style>{workspaceStyle}</style>
        <div className="app">
          <Navbar onPricing={() => setPage("pricing")} onLogin={() => setPage("login")} setPage={setPage} />
          <Pricing onBack={() => setPage("home")} />
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{workspaceStyle}</style>
      <div className="app">
        <Navbar onPricing={() => setPage("pricing")} onLogin={() => setPage("login")} setPage={setPage} />
        <Hero />

        {user && (
          <div className="limit-banner">
            <span>
              {limit === Infinity
                ? `Unlimited analyses · ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan`
                : `${remaining} of ${limit} analyses remaining · ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan`}
            </span>
            {limit !== Infinity && remaining <= 1 && (
              <button onClick={() => setPage("pricing")}>Upgrade →</button>
            )}
          </div>
        )}

        <div className="workspace">
          <InputPanel
            tab={tab}             setTab={setTab}
            text={text}           setText={setText}
            file={file}           setFile={setFile}
            setImgData={setImgData}
            focus={focus}         toggleFocus={toggleFocus}
            status={status}       error={error}
            onAnalyze={handleAnalyze}
            canGo={canGo}
            limitReached={limitReached}
            notLoggedIn={!user}
          />
          <ResultsPanel
            status={status}
            result={result}
            contractText={contractText}
          />
        </div>

        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}