"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function VehicleDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // Filter and find the vehicle
          const filtered = data.filter(
            (v) => v.vno && v.product
          );
          const found = filtered.find((v) => v.id === parseInt(id));
          if (!found) {
            setError("Vehicle not found");
          }
          setVehicle(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to fetch vehicle: ${err.message}`);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container
        sx={{
          mt: 5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error || !vehicle) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Vehicle Not Found"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
        >
          Back to List
        </Button>
      </Container>
    );
  }

  // Helper function to display field with label
  const DetailField = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "textSecondary",
          fontWeight: "bold",
          fontSize: "0.85rem",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontSize: "1rem",
          color: "textPrimary",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: "#f9f9f9" }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: "bold",
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
            }}
          >
            {vehicle.product}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              fontSize: "1.25rem",
              mb: 2,
            }}
          >
            {vehicle.vno}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailField label="Owner Name" value={vehicle.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailField label="Year" value={vehicle.year} />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Financial Details */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: "1.1rem",
            color: "primary.main",
          }}
        >
          Financial Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DetailField label="Rate/Charge" value={`₹${vehicle.rate}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Final Price" value={`₹${vehicle.finalPrice}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField
              label="Sold Price"
              value={`₹${vehicle.soldPrice}`}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Advance" value={`₹${vehicle.advance}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Balance" value={`₹${vehicle.balance}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Expenses (RC)" value={`₹${vehicle.rcRate}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Mechanical Expense" value={`₹${vehicle.mecExpense}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Extra Expense" value={`₹${vehicle.extrExpense}`} />
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicle Information */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: "1.1rem",
            color: "primary.main",
          }}
        >
          Vehicle Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DetailField label="Vehicle Number" value={vehicle.vno} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Kilometer" value={vehicle.km} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="RC Status" value={vehicle.rc} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Year" value={vehicle.year} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Case Type" value={vehicle.case} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="General Expense" value={vehicle.expense} />
          </Grid>
        </Grid>
      </Paper>

      {/* Engine & Chassis Details */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: "1.1rem",
            color: "primary.main",
          }}
        >
          Engine & Chassis Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DetailField label="Engine Number" value={vehicle.engNo} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Chassis Number" value={vehicle.chassNo} />
          </Grid>
        </Grid>
      </Paper>

      {/* Remarks */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: "1.1rem",
            color: "primary.main",
          }}
        >
          Additional Information
        </Typography>
        <DetailField label="Remarks" value={vehicle.remarks} />
      </Paper>

      {/* Back Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{
            px: { xs: 3, sm: 4, md: 5 },
            py: 1.5,
            fontSize: "1rem",
          }}
        >
          Back to Inventory
        </Button>
      </Box>
    </Container>
  );
}