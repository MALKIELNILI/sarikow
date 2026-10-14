import { useState } from "react";
import * as XLSX from "xlsx";
import { fbSet } from "../firebase.js";

export default function ExcelImportTab({ avrechim, onImport }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("טוען קובץ...");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // עדכון אברכים עם נתוני נוכחות מהקובץ
      const updatedAvrechim = avrechim.map(av => {
        const row = data.find(r => r["שם"] === av.name || r["name"] === av.name);
        if (row) {
          return {
            ...av,
            days_worked: row["ימים בעבודה"] || row["days"] || av.days_worked || 0,
            hours_worked: row["שעות עבודה"] || row["hours"] || av.hours_worked || 0
          };
        }
        return av;
      });

      // שמירה ב-Firebase
      await fbSet("avrechim", updatedAvrechim);
      setMessage("✅ הייבוא הצליח! הנתונים עודכנו.");

      if (onImport) onImport(updatedAvrechim);
    } catch (error) {
      setMessage(`❌ שגיאה: ${error.message}`);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>📥 ייבוא נוכחות מ-Excel</h2>

      <div style={{
        border: "2px dashed #2563eb",
        borderRadius: "8px",
        padding: "30px",
        textAlign: "center",
        marginBottom: "20px"
      }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          disabled={loading}
          style={{
            padding: "10px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        />
        <p style={{ color: "#666", marginTop: "10px", fontSize: "14px" }}>
          תמך: .xlsx, .xls, .csv<br/>
          הקובץ צריך לכלול עמודה "שם" עם שמות אברכים
        </p>
      </div>

      {loading && <p style={{ color: "#0066cc" }}>⏳ {message}</p>}
      {!loading && message && (
        <p style={{
          color: message.includes("✅") ? "#22aa22" : "#dd0000",
          padding: "10px",
          borderRadius: "4px",
          backgroundColor: message.includes("✅") ? "#eeffee" : "#ffeeee"
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
