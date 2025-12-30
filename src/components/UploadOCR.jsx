import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function UploadOCR({ onExtract }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(file, "eng", { logger: (m) => {} });
      const extracted = data.text;
      setText(extracted);
      onExtract(extracted);
    } catch (err) {
      console.error(err);
      alert("OCR failed — you can paste ingredient text instead.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = () => {
    // Split by commas and newlines
    const arr = text.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
    onExtract(arr.join(", "));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label>
        <strong>Upload label image (or paste ingredient text)</strong><br />
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      <div style={{ marginTop: 8 }}>
        <textarea
          rows={4}
          placeholder="Or paste ingredient text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      <button onClick={handlePaste} disabled={!text}>
        Use Text
      </button>
      {loading && <div>Processing OCR...</div>}
    </div>
  );
}