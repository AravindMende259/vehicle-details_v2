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
  const [deliveryFilter, setDeliveryFilter] = useState("all"); // all | available | partial | sold | delivered

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

  const parseAmount = (value) => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(
      value
        .toString()
        .replace(/[^0-9.-]/g, "")
    );
    return Number.isNaN(num) ? 0 : num;
  };

  const getSaleStatus = (vehicle) => {
    const rawSalePrice = parseAmount(vehicle.salePrice);
    const rawTotalPrice = parseAmount(vehicle.totalVehiclePrice);
    // Prefer sale price when present and > 0, otherwise fall back to total vehicle price
    const salePrice = rawSalePrice > 0 ? rawSalePrice : rawTotalPrice;

    const paid = Math.max(
      parseAmount(vehicle.totalPaid),
      parseAmount(vehicle.received)
    );
    let balance = parseAmount(vehicle.balance);

    if (!balance && salePrice) {
      balance = Math.max(salePrice - paid, 0);
    }

    if (!salePrice) return "available";
    if (paid <= 0) return "available";
    if (paid > 0 && balance > 0) return "partial";
    return "sold";
  };

  const isDeliveredVehicle = (vehicle) => {
    const val = vehicle.vehicleDelivered?.toString().trim().toLowerCase();
    if (!val) return false;
    if (val === "n" || val === "no") return false;
    if (val.startsWith("n ")) return false;
    return true;
  };

  const isYetToReceive = (vehicle) => {
    const val = vehicle.received?.toString().trim().toLowerCase();
    if (!val) return false;
    // Treat any value that starts with "n" (N, No, Not) as "yet to receive"
    return val.startsWith("n");
  };

  const getStatusLabel = (vehicle) => {
    const saleStatus = getSaleStatus(vehicle);
    if (saleStatus === "partial") return "Partially sold";
    if (saleStatus === "sold") return "Sold";
    return "Available for sale";
  };

  const getStatusChipProps = (vehicle) => {
    const saleStatus = getSaleStatus(vehicle);
    if (saleStatus === "partial") {
      return { color: "warning", variant: "filled" };
    }
    if (saleStatus === "sold") {
      return { color: "success", variant: "filled" };
    }
    return { color: "default", variant: "outlined" };
  };

  const metrics = vehicles.reduce(
    (acc, vehicle) => {
      acc.total += 1;
      const saleStatus = getSaleStatus(vehicle);
      if (saleStatus === "available") acc.available += 1;
      else if (saleStatus === "partial") acc.partial += 1;
      else if (saleStatus === "sold") acc.sold += 1;
      if (isDeliveredVehicle(vehicle)) acc.delivered += 1;
      if (isYetToReceive(vehicle)) acc.yetToReceive += 1;
      return acc;
    },
    { total: 0, available: 0, partial: 0, sold: 0, delivered: 0, yetToReceive: 0 }
  );

  // Filter vehicles based on search query and status
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        vehicle.vno?.toLowerCase().includes(searchLower) ||
        vehicle.product?.toLowerCase().includes(searchLower)
      );
    })
    .filter((vehicle) => {
      const saleStatus = getSaleStatus(vehicle);
      const delivered = isDeliveredVehicle(vehicle);
      if (deliveryFilter === "available") return saleStatus === "available";
      if (deliveryFilter === "partial") return saleStatus === "partial";
      if (deliveryFilter === "sold") return saleStatus === "sold";
      if (deliveryFilter === "delivered") return delivered;
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
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontSize: {
              xs: "1.4rem",
              sm: "1.8rem",
              md: "2.1rem",
            },
          }}
        >
          Vehicle Inventory
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: "0.85rem" }}
        >
          Quick view of stock, sales and delivery status
        </Typography>
      </Box>

      {/* Summary metrics */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={3}>
            <Paper
              sx={{
                p: 1.25,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#f3f4f6",
              }}
            >
              <Typography
                variant="caption"
                sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Total
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mt: 0.25, fontSize: "1.1rem" }}
              >
                {metrics.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              sx={{
                p: 1.25,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#ecfdf3",
              }}
            >
              <Typography
                variant="caption"
                sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Sold
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mt: 0.25,
                  fontSize: "1.1rem",
                  color: "success.main",
                }}
              >
                {metrics.sold}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              sx={{
                p: 1.25,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#fffbeb",
              }}
            >
              <Typography
                variant="caption"
                sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Partial
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mt: 0.25,
                  fontSize: "1.1rem",
                  color: "warning.main",
                }}
              >
                {metrics.partial}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              sx={{
                p: 1.25,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#eff6ff",
              }}
            >
              <Typography
                variant="caption"
                sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Available
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mt: 0.25,
                  fontSize: "1.1rem",
                  color: "info.main",
                }}
              >
                {metrics.available-metrics.yetToReceive}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              sx={{
                mt: { xs: 1.5, sm: 0 },
                p: 1.25,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "#fee2e2",
              }}
            >
              <Typography
                variant="caption"
                sx={{ textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Yet to receive
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mt: 0.25,
                  fontSize: "1.1rem",
                  color: "error.main",
                }}
              >
                {metrics.yetToReceive}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

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
            <InputLabel id="delivery-filter-label">Status</InputLabel>
            <Select
              labelId="delivery-filter-label"
              value={deliveryFilter}
              label="Status"
              onChange={(e) => setDeliveryFilter(e.target.value)}
              sx={{ backgroundColor: "#fff", borderRadius: "10px" }}
            >
              <MenuItem value="all">All vehicles</MenuItem>
              <MenuItem value="available">Available for sale</MenuItem>
              <MenuItem value="partial">Partially sold</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
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
                      {...getStatusChipProps(vehicle)}
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
                        {...getStatusChipProps(vehicle)}
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
