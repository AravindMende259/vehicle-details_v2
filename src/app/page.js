"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
} from "@mui/material";

export default function Home() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("all"); // all | available | delivered

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // Filter out vehicles with empty vno or product
          const filteredVehicles = data.filter(
            (vehicle) => vehicle.vno && vehicle.product
          );
          setVehicles(filteredVehicles);
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to fetch vehicles: ${err.message}`);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "600px",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Loading vehicles from Google Sheets...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ marginTop: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Container sx={{ marginTop: 5 }}>
        <Alert severity="info">
          No vehicles found in Google Sheet. Add data to your sheet first.
        </Alert>
      </Container>
    );
  }

  const getDeliveryStatus = (vehicle) => {
    const raw = vehicle.vehicleDelivered?.toString().trim();
    if (!raw) return "available"; // Available for sale
    return "delivered";
  };

  const getStatusLabel = (vehicle) => {
    const raw = vehicle.vehicleDelivered?.toString().trim();
    if (!raw) return "Available for sale";
    return raw;
  };

  // Filter vehicles based on search query and delivery status
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        vehicle.vno?.toLowerCase().includes(searchLower) ||
        vehicle.product?.toLowerCase().includes(searchLower)
      );
    })
    .filter((vehicle) => {
      const status = getDeliveryStatus(vehicle);
      if (deliveryFilter === "available") return status === "available";
      if (deliveryFilter === "delivered") return status === "delivered";
      return true;
    });

  return (
    <Container
      maxWidth="md"
      sx={{
        marginTop: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: "center",
          mb: 4,
          fontWeight: "bold",
          fontSize: {
            xs: "1.5rem",
            sm: "2rem",
            md: "2.5rem",
          },
        }}
      >
        Vehicle Inventory
      </Typography>

      {/* Search & Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by Vehicle No or Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              backgroundColor: "#fff",
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontSize: "1rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="medium">
            <InputLabel id="delivery-filter-label">Vehicle Delivered</InputLabel>
            <Select
              labelId="delivery-filter-label"
              value={deliveryFilter}
              label="Vehicle Delivered"
              onChange={(e) => setDeliveryFilter(e.target.value)}
              sx={{ backgroundColor: "#fff", borderRadius: "10px" }}
            >
              <MenuItem value="all">All vehicles</MenuItem>
              <MenuItem value="available">Available for sale</MenuItem>
              <MenuItem value="delivered">Delivered only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Responsive View - Combined Table */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  VEHICLE NO
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  VEHICLE MODEL
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  TOTAL VEHICLE PRICE
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  VEHICLE DELIVERED
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  NOTES
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/vehicle/${vehicle.id}`)}
                >
                  <TableCell sx={{ fontSize: "0.95rem" }}>
                    {vehicle.vno || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.95rem" }}>
                    {vehicle.product || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.95rem", fontWeight: "bold", color: "green" }}>
                    ₹{vehicle.finalPrice || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.95rem" }}>
                    <Chip
                      label={getStatusLabel(vehicle)}
                      size="small"
                      color={getDeliveryStatus(vehicle) === "delivered" ? "success" : "warning"}
                      variant={getDeliveryStatus(vehicle) === "delivered" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.95rem" }}>
                    {vehicle.remarks || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem" }}>
                    <Typography
                      component="span"
                      sx={{
                        cursor: "pointer",
                        color: "primary.main",
                        fontWeight: "bold",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View Details
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile View - Card Grid */}
      <Grid
        container
        spacing={2}
        sx={{
          display: { xs: "block", md: "none" },
        }}
      >
        {filteredVehicles.map((vehicle) => (
          <Grid item xs={12} key={vehicle.id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.25s ease",
                borderRadius: 2,
                boxShadow: 2,
                mt: 1,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                },
              }}
              onClick={() => router.push(`/vehicle/${vehicle.id}`)}
            >
              <CardContent sx={{ p: 2.25 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1.5,
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      sx={{ fontSize: "0.75rem", mb: 0.25 }}
                    >
                      VEHICLE NO
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {vehicle.vno}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mt: 0.5,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {vehicle.product}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", minWidth: "40%" }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      TOTAL PRICE
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.05rem",
                        fontWeight: "bold",
                        color: "green",
                      }}
                    >
                      ₹{vehicle.finalPrice || "-"}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={getStatusLabel(vehicle)}
                        size="small"
                        color={
                          getDeliveryStatus(vehicle) === "delivered"
                            ? "success"
                            : "warning"
                        }
                        variant={
                          getDeliveryStatus(vehicle) === "delivered"
                            ? "filled"
                            : "outlined"
                        }
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    sx={{ fontSize: "0.75rem", mb: 0.25 }}
                  >
                    NOTES
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {vehicle.remarks || "-"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
