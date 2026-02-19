import  { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import {IMAGE_BASE_URL} from "../api/axiosInstance"; // ✅ USE axiosInstance
import {getAllDocumentConfiguration} from '../api/endpoint'
const documentTypes = [
  "Report",
  "Agreement",
  "Policy",
  "Invoice",
  "Manual",
  "Other",
];

export default function DMS() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET LOGGED-IN USER ID (store during login)
  const currentUserId = Number(localStorage.getItem("applicant_id"));

  const handleOpen = async (type: string) => {
    setSelectedType(type);
    setOpen(true);
    setLoading(true);

    try {
      // ⬇️ USE axiosInstance instead of axios
      const res = await getAllDocumentConfiguration();

      const allDocs = res.data;

      // FILTER BY TYPE + ASSIGNED USER
      const assignedDocs = allDocs.filter(
        (doc: any) =>
          doc.document_type === type &&
          Array.isArray(doc.shared_user_ids) &&
          doc.shared_user_ids.includes(currentUserId)
      );

      setDocuments(assignedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setDocuments([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Document Type Folders
      </Typography>

      {/* 📁 Folder Section */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {documentTypes.map((type) => (
          <Box
            key={type}
            sx={{
              width: { xs: "100%", sm: "48%", md: "30%" },
            }}
          >
            <Card
              onClick={() => handleOpen(type)}
              sx={{
                p: 2,
                borderRadius: 3,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": { boxShadow: 5, bgcolor: "#f5f5f5" },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <FolderIcon sx={{ fontSize: 50, mb: 1, color: "#1976d2" }} />
                <Typography variant="h6" fontWeight={600}>
                  {type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View all {type} documents
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 📄 Document Popup */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selectedType} Documents</DialogTitle>

        <DialogContent>
          {loading ? (
            <CircularProgress />
          ) : documents.length === 0 ? (
            <Typography>No data found.</Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {documents.map((doc: any) => (
                <Card key={doc.id} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                  <Typography fontWeight={600}>{doc.file_name}</Typography>
                  <Typography variant="body2">Uploaded By: {doc.uploaded_by}</Typography>
                  <Typography variant="body2">Upload Date: {doc.upload_date}</Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() =>
                      window.open(
                        `${IMAGE_BASE_URL}${doc.upload_file}`,
                        "_blank"
                      )
                    }
                  >
                    View Document
                  </Button>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
