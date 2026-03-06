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
  Chip,
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

  const getDeliveryStatusLabel = () => {
    const raw = vehicle.vehicleDelivered?.toString().trim();
    if (!raw) return "Available for sale";
    return raw;
  };

  const isDelivered = () =>
    Boolean(vehicle.vehicleDelivered && vehicle.vehicleDelivered.toString().trim() !== "");

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
    <Container
      maxWidth="sm"
      sx={{
        mt: { xs: 2, sm: 3 },
        mb: { xs: 4, sm: 5 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: "#f9f9f9",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 0.5,
              fontWeight: "bold",
              fontSize: { xs: "1.4rem", sm: "1.9rem", md: "2.4rem" },
            }}
          >
            {vehicle.product}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              fontSize: "1.05rem",
              mb: 1,
            }}
          >
            {vehicle.vno}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={getDeliveryStatusLabel()}
              color={isDelivered() ? "success" : "warning"}
              variant={isDelivered() ? "filled" : "outlined"}
              size="small"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailField label="Customer Name" value={vehicle.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailField label="Year" value={vehicle.year} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailField label="Brand" value={vehicle.brand} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailField label="Contact Number" value={vehicle.contactNo} />
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
            <DetailField label="Bid Rate" value={`₹${vehicle.rate}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Cost Price (C1)" value={`₹${vehicle.costPriceC1}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Additional Cost (C2)" value={`₹${vehicle.additionalCostC2}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="RC Rate" value={`₹${vehicle.rcRate}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Insurance" value={`₹${vehicle.insurance}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="FC / Service Cost" value={`₹${vehicle.fcServiceCost}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Actual Cost" value={`₹${vehicle.actualCost}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Total Vehicle Price" value={`₹${vehicle.totalVehiclePrice}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Sale Price" value={`₹${vehicle.salePrice}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Profit" value={`₹${vehicle.profit}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Total Paid" value={`₹${vehicle.totalPaid}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Balance" value={`₹${vehicle.balance}`} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Received" value={`₹${vehicle.received}`} />
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicle & Case Information */}
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
          Vehicle & Case Information
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
            <DetailField label="NOC" value={vehicle.noc} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Bank Address" value={vehicle.bankAddress} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="RC Book / Ref No" value={vehicle.rcBookRefNo} />
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
          <Grid item xs={12}>
            <DetailField label="KM Driven" value={vehicle.km} />
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Details */}
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
          Customer Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DetailField label="Customer Name" value={vehicle.name} />
          </Grid>
          <Grid item xs={12}>
            <DetailField label="Customer Address" value={vehicle.customerAddress} />
          </Grid>
          <Grid item xs={12}>
            <DetailField label="Contact Number" value={vehicle.contactNo} />
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
        <DetailField label="Notes" value={vehicle.remarks} />
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