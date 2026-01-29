import React, { useState } from "react";
import "./Dashboard.css";
import UploadOCR from "./components/UploadOCR";
import Header from "./components/Header";
import { analyzeIngredients } from "./utils/analyzer";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [ingredientsText, setIngredientsText] = useState("");
  const [result, setResult] = useState(null);

  const onExtract = (raw) => {
    // raw may be big text; extract ingredient list heuristically
    const tokens = raw.split(/,|\n/).map(t => t.trim()).filter(Boolean);
    setIngredientsText(tokens.join(", "));
    const analysis = analyzeIngredients(tokens);
    setResult(analysis);
  };

  return (
    <div className="app-container">
      <Header />
      <div className="dashboard-grid">
        <div className="uploader-card card">
          <h1>Cosmetic Safety Dashboard</h1>

          <UploadOCR onExtract={onExtract} />

          {!result && <div>Upload an image or paste text to start analysis.</div>}
        </div>
        <div className="results-card card">
          {result && (
            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 10 }}>
                <strong>Overall Safety Score:</strong>{" "}
                <span style={{ fontSize: 24, fontWeight: "bold" }}>{result.score} / 10</span>
              </div>

              <div style={{ maxWidth: 700 }}>
                <Bar
                  data={{
                    labels: result.ingredients.map((i) => i.name),
                    datasets: [{ label: "Risk (0-10)", data: result.ingredients.map((i) => i.risk), backgroundColor: "rgba(255,99,132,0.6)" }]
                  }}
                  options={{ responsive: true }}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <h3>Detected ingredients & notes</h3>
                <ul>
                  {result.ingredients.map((i, idx) => (
                    <li key={idx}>
                      <strong>{i.name}</strong> — <em>{i.category}</em> — risk {i.risk}/10
                      <div style={{ color: "#555" }}>{i.notes}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}