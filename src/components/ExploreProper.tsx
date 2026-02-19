import React, { useEffect, useState } from "react";
import axiosInstance2 from "../api/axiosInstance";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

// --- Types ---
interface PropertyMedia {
  id: number;
  media_type: string;
  file: string;
  notes: string | null;
  property: number;
}

interface Property {
  id: number;
  title: string;
  property_type: string;
  project_id: string;
  status: string;
  media: PropertyMedia[];
}

const ExploreProper: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Properties
  const fetchProperties = async () => {
    try {
      const res = await axiosInstance2.get(
        "/explore_properties/property/"
      );

      setProperties(res.data);
      setError(null);
    } catch (err: any) {
      console.error("ERROR FETCHING PROPERTIES:", err);
      setError("Unable to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Loading UI
  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 5 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading properties...
        </Typography>
      </Box>
    );
  }

  // Error UI
  if (error) {
    return (
      <Box textAlign="center" sx={{ mt: 5, color: "error.main" }}>
        <Typography variant="h6">🚨 {error}</Typography>
      </Box>
    );
  }

  // Empty UI
  if (properties.length === 0) {
    return (
      <Box textAlign="center" sx={{ mt: 5 }}>
        <Typography variant="h6">No properties found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        p: 2,
      }}
    >
      {properties.map((property: Property) => {
        // Choose image
        const mainMedia =
          property.media?.find((m) => m.media_type === "banner1") ||
          property.media?.find((m) => m.media_type === "preview");

        const imageURL = mainMedia
          ? `http://127.0.0.1:8001${mainMedia.file}`
          : "https://via.placeholder.com/800x400?text=No+Image";

        return (
          <Card
            key={property.id}
            sx={{
              width: 350,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={imageURL}
              alt={property.title}
              sx={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                objectFit: "cover",
              }}
            />

            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, height: 50, overflow: "hidden" }}
              >
                {property.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {property.property_type} • Project ID: {property.project_id}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color:
                    property.status === "Sold" ? "error.main" : "success.main",
                }}
              >
                Status: {property.status}
              </Typography>

              <Box sx={{ textAlign: "right" }}>
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                  onClick={() =>
                    window.open(`/property-details/${property.id}`, "_self")
                  }
                >
                  I am Interested →
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default ExploreProper;
