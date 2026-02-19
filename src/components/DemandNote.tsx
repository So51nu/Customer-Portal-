import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { DEMAND_NOTES } from "../api/endpoint";

const DemandNote: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Read applicant_id directly from localStorage
  const loggedApplicantId = Number(localStorage.getItem("applicant_id"));

  useEffect(() => {
    const fetchDemandNotes = async () => {
      try {
        setLoading(true);

        if (!loggedApplicantId) {
          setErrorMsg("Applicant ID not found in localStorage.");
          setLoading(false);
          return;
        }

        const dnRes = await axiosInstance.get(DEMAND_NOTES);
        const allDemandNotes = dnRes.data;

        const filteredNotes = allDemandNotes.filter(
          (note: any) => Number(note?.applicant?.id) === loggedApplicantId
        );

        setNotes(filteredNotes);
      } catch (error) {
        console.error("Error fetching demand notes:", error);
        setErrorMsg("Failed to load demand notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchDemandNotes();
  }, [loggedApplicantId]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontWeight: 700, marginBottom: "20px" }}>📄 Demand Notes</h2>

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            padding: "14px",
            background: "#ffe5e5",
            border: "1px solid #ff7676",
            color: "#a30000",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        >
          ❗ {errorMsg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ fontSize: "16px", color: "#555" }}>Loading...</div>
      )}

      {/* If No Notes */}
      {!loading && notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#777",
            fontSize: "17px",
          }}
        >
          No demand notes found for this applicant.
        </div>
      )}

      {/* List of Demand Notes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget.style.transform = "translateY(-4px)");
              (e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.1)");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget.style.transform = "translateY(0px)");
              (e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(0,0,0,0.05)");
            }}
          >
            <h3 style={{ marginBottom: "8px", color: "#333" }}>
              {note.demand_id}
            </h3>

            <div style={{ marginBottom: "10px", color: "#555" }}>
              <b>Milestone:</b> {note.milestone}
            </div>

            <div style={{ marginBottom: "10px", color: "#444" }}>
              <b>Total Amount:</b>{" "}
              <span style={{ color: "#0a7c2e", fontWeight: 600 }}>
                ₹ {note.total}
              </span>
            </div>

            <div style={{ marginBottom: "10px", color: "#666" }}>
              <b>Due Date:</b> {formatDate(note.due_date)}
            </div>

            {/* Status Badge */}
            <span
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                borderRadius: "20px",
                background:
                  note.status === "Paid"
                    ? "#d4f8d4"
                    : note.status === "Pending"
                    ? "#fff4cc"
                    : "#ffdfdf",
                color:
                  note.status === "Paid"
                    ? "#1d7a1d"
                    : note.status === "Pending"
                    ? "#b88b00"
                    : "#b30000",
                fontWeight: 600,
              }}
            >
              {note.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemandNote;
