import { google } from "googleapis";

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
      range: "Sheet1!A2:S",
    });

    // Column headers mapping
    const headers = [
      "name",      // 0
      "product",   // 1
      "km",        // 2
      "vno",       // 3 - V.NO
      "rc",        // 4
      "year",      // 5
      "rate",      // 6 - RATE=CHARGE
      "case",      // 7
      "expense",   // 8 - EXPENCE
      "rcRate",    // 9 - RC RATE
      "mecExpense", // 10 - MEC EXPNCE
      "finalPrice", // 11 - FINAL PRICE
      "extrExpense", // 12 - EXTR EXPNCE
      "remarks",   // 13
      "engNo",     // 14 - eng no
      "chassNo",   // 15 - chass no
      "soldPrice", // 16 - sold price
      "advance",   // 17
      "balance",   // 18
    ];

    // Check if data exists
    if (!response.data.values || response.data.values.length === 0) {
      console.warn("No data found in Google Sheet");
      return Response.json([]);
    }

    // Transform the 2D array into objects with proper keys, filtering out empty rows and date rows
    const vehicles = response.data.values
      .filter((row) => {
        // Skip empty rows
        if (!row || row.length === 0) return false;
        // Skip rows that contain only dates (single cell with date format)
        if (row.length === 1 && /^\d{2}-\d{2}-\d{4}$/.test(row[0])) return false;
        // Skip rows with only "L AND T" or other section headers
        if (row.length === 1 && row[0] && row[0].match(/^[A-Z\s&]+$/)) return false;
        return true;
      })
      .map((row, index) => {
        const vehicle = { id: index + 1 };
        headers.forEach((header, colIndex) => {
          vehicle[header] = row[colIndex] || "";
        });
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
