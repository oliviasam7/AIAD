import React, { useState } from "react";
import "./styles/global.css";

import Navbar       from "./components/Navbar";
import Hero         from "./components/Hero";
import InputPanel   from "./components/InputPanel";
import ResultsPanel from "./components/ResultsPanel";
import Footer       from "./components/Footer";

import { analyzeContract, readFileAsText } from "./utils/api";

const workspaceStyle = `
.workspace {
  position: relative; z-index: 1;
  flex: 1; display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; border-top: 1px solid var(--border);
  max-width: 100%;
}
`;

export default function App() {
  const [tab, setTab]                 = useState("text");
  const [text, setText]               = useState("");
  const [file, setFile]               = useState(null);
  const [imgData, setImgData]         = useState(null);
  const [extractedText, setExtractedText] = useState(""); // ← NEW

  const [focus, setFocus] = useState(["risks", "financials", "obligations"]);
  const toggleFocus = (id) =>
    setFocus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const canGo =
    (tab === "text" ? text.trim().length > 40 : !!file) &&
    focus.length > 0 &&
    status !== "loading";

  const handleAnalyze = async () => {
    setStatus("loading");
    setError("");
    setResult(null);
    setExtractedText(""); // ← reset on new analysis
    try {
      let analysis;
      if (tab === "text") {
        if (!text.trim() || text.trim().length < 40)
          throw new Error("Please paste at least a few sentences of contract text.");
        setExtractedText(text); // ← store plain text too
        analysis = await analyzeContract(text, focus, null);
      } else {
        if (!file) throw new Error("Please upload a file.");
        if (file.size > 5 * 1024 * 1024)
          throw new Error("File is too large. Please upload a file under 5MB.");
        if (file.type.startsWith("image/")) {
          // Images: no text to extract, pass empty string
          setExtractedText("[Image contract — chatbot and translation unavailable for image uploads]");
          analysis = await analyzeContract("", focus, imgData);
        } else {
          const content = await readFileAsText(file);
          setExtractedText(content); // ← KEY FIX: store extracted file text
          analysis = await analyzeContract(content, focus, null);
        }
      }
      setResult(analysis);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  // ← FIXED: use extractedText instead of only tab===text
  const contractText = extractedText;

  return (
    <>
      <style>{workspaceStyle}</style>
      <div className="app">
        <Navbar />
        <Hero />

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