"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
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

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.vno?.toLowerCase().includes(searchLower) ||
      vehicle.product?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: 3, sm: 4, md: 5 }, pb: { xs: 3, sm: 4, md: 5 } }}
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

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search by V.NO or Product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="medium"
          sx={{
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "1rem",
            },
          }}
        />
      </Box>

      {/* Responsive View - Combined Table */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  V.NO
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  PRODUCT
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  FINAL PRICE
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  REMARKS
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
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        {filteredVehicles.map((vehicle) => (
          <Grid item xs={12} key={vehicle.id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => router.push(`/vehicle/${vehicle.id}`)}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    V.NO
                  </Typography>
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {vehicle.vno}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    PRODUCT
                  </Typography>
                  <Typography sx={{ fontSize: "1rem" }}>
                    {vehicle.product}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    FINAL PRICE
                  </Typography>
                  <Typography
                    sx={{ fontSize: "1.1rem", fontWeight: "bold", color: "green" }}
                  >
                    ₹{vehicle.finalPrice || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    REMARKS
                  </Typography>
                  <Typography sx={{ fontSize: "0.95rem" }}>
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
