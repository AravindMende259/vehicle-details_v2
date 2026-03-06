import { google } from "googleapis";

function normalizeHeader(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toCamelCase(value) {
  const parts = normalizeHeader(value).split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("");
}

export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error("GOOGLE_CLIENT_EMAIL is not set");
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("GOOGLE_PRIVATE_KEY is not set");
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error("GOOGLE_SHEET_ID is not set");
    }

    // Parse the private key (remove surrounding quotes and handle escape sequences)
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Replace actual newline escapes with newlines
    privateKey = privateKey.replace(/\\n/g, "\n");

    // Create JWT auth object
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    // Explicitly authorize the JWT to get access token
    await auth.authorize();

    // Initialize sheets API with the authorized auth object
    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      // Read the header row + data rows for the new format (31 columns => AE)
      range: "Sheet1!A1:AE",
    });

    const values = response.data.values || [];

    // Check if data exists
    if (values.length === 0) {
      console.warn("No data found in Google Sheet");
      return Response.json([]);
    }

    const headerRow = values[0] || [];

    // Map sheet headers (new Excel/Sheet format) -> internal keys used by UI
    const headerToKey = {
      [normalizeHeader("Serial No")]: "serialNo",
      [normalizeHeader("Brand")]: "brand",
      [normalizeHeader("RC")]: "rc",
      [normalizeHeader("NOC")]: "noc",
      [normalizeHeader("Bank Address")]: "bankAddress",
      [normalizeHeader("Vehicle No")]: "vno",
      [normalizeHeader("Vehicle Model")]: "product",
      [normalizeHeader("Year")]: "year",
      [normalizeHeader("Engine No")]: "engNo",
      [normalizeHeader("KM Driven")]: "km",
      [normalizeHeader("Chassis No")]: "chassNo",
      [normalizeHeader("Customer Name")]: "name",
      [normalizeHeader("Customer Address")]: "customerAddress",
      [normalizeHeader("Contact No")]: "contactNo",
      [normalizeHeader("RC Book / Ref No")]: "rcBookRefNo",
      [normalizeHeader("Bid Rate")]: "rate",
      [normalizeHeader("Profit")]: "profit",
      [normalizeHeader("Cost Price (C1 Price)")]: "costPriceC1",
      [normalizeHeader("Additional Cost (C2 Addl)")]: "additionalCostC2",
      [normalizeHeader("RC Rate")]: "rcRate",
      [normalizeHeader("Case")]: "case",
      [normalizeHeader("Insurance")]: "insurance",
      [normalizeHeader("FC / Service Cost")]: "fcServiceCost",
      [normalizeHeader("Actual cost")]: "actualCost",
      [normalizeHeader("Total Vehicle Price")]: "totalVehiclePrice",
      [normalizeHeader("Sale Price")]: "salePrice",
      [normalizeHeader("Balance")]: "balance",
      [normalizeHeader("Total Paid")]: "totalPaid",
      [normalizeHeader("Vehicle Delivered")]: "vehicleDelivered",
      [normalizeHeader("Notes")]: "remarks",
      // "Received............" (normalize strips punctuation, so this matches even with dots)
      [normalizeHeader("Received")]: "received",
    };

    // Build column index -> key mapping (based on the header row)
    const colKeys = headerRow.map((h) => {
      const normalized = normalizeHeader(h);
      return headerToKey[normalized] || toCamelCase(h);
    });

    // Transform the 2D array into objects with proper keys, filtering out empty rows
    const vehicles = values
      .slice(1)
      .filter((row) => {
        if (!row || row.length === 0) return false;
        const hasAnyValue = row.some((cell) => String(cell ?? "").trim() !== "");
        return hasAnyValue;
      })
      .map((row, index) => {
        const vehicle = {};
        colKeys.forEach((key, colIndex) => {
          if (!key) return;
          vehicle[key] = row[colIndex] ?? "";
        });

        // Ensure stable id and backwards-compatible fields used by UI
        vehicle.id = vehicle.serialNo ? Number(vehicle.serialNo) : index + 1;
        vehicle.finalPrice = vehicle.totalVehiclePrice ?? vehicle.finalPrice ?? "";
        vehicle.soldPrice = vehicle.salePrice ?? vehicle.soldPrice ?? "";
        vehicle.advance = vehicle.totalPaid ?? vehicle.advance ?? "";

        return vehicle;
      });

    return Response.json(vehicles);
  } catch (error) {
    console.error("API Error Message:", error.message);
    console.error("Full Error:", error);

    let errorMessage = error.message || "Failed to fetch data";
    let status = 500;

    // Handle specific error cases
    if (error.message.includes("unregistered callers")) {
      errorMessage =
        "Authentication Error: Service account is not added to the Google Sheet as EDITOR. Please share the sheet with: " +
        process.env.GOOGLE_CLIENT_EMAIL;
      status = 401;
    } else if (
      error.message.includes("Invalid credentials") ||
      error.message.includes("invalid_grant")
    ) {
      errorMessage =
        "Authentication failed: Private key may be invalid or expired. Regenerate service account key.";
      status = 401;
    } else if (
      error.message.includes("not found") ||
      error.message.includes("404")
    ) {
      errorMessage = `Google Sheet not found. Sheet ID: ${process.env.GOOGLE_SHEET_ID}. Verify GOOGLE_SHEET_ID is correct and the service account has access.`;
      status = 404;
    } else if (
      error.message &&
      error.message.toLowerCase().includes("permission")
    ) {
      errorMessage =
        "Permission denied: Service account email must be added as EDITOR to the spreadsheet.";
      status = 403;
    }

    return Response.json(
      { error: errorMessage, details: error.message },
      { status },
    );
  }
}
