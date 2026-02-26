// Test authentication without Next.js
import { google } from "googleapis";

async function testAuth() {
  try {
    console.log("🧪 Testing Google Sheets API Authentication...\n");

    // Check environment variables
    console.log("1️⃣ Checking environment variables...");
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail) throw new Error("❌ GOOGLE_CLIENT_EMAIL not set");
    if (!privateKey) throw new Error("❌ GOOGLE_PRIVATE_KEY not set");
    if (!sheetId) throw new Error("❌ GOOGLE_SHEET_ID not set");

    console.log("✅ All environment variables are set");
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Sheet ID: ${sheetId}`);

    // Parse private key
    console.log("\n2️⃣ Parsing private key...");
    let key = privateKey;
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }
    key = key.replace(/\\n/g, "\n");
    console.log("✅ Private key parsed successfully");

    // Create JWT auth
    console.log("\n3️⃣ Creating JWT authentication...");
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    console.log("✅ JWT auth object created");

    // Authorize
    console.log("\n4️⃣ Authorizing JWT...");
    await auth.authorize();
    console.log("✅ JWT authorized successfully");

    // Create sheets client
    console.log("\n5️⃣ Creating Google Sheets client...");
    const sheets = google.sheets({ version: "v4", auth });
    console.log("✅ Google Sheets client created");

    // Test API call
    console.log("\n6️⃣ Fetching data from Google Sheet...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:D10",
    });
    console.log("✅ Successfully fetched data!");
    console.log("\n📊 Data from sheet:");
    console.log(JSON.stringify(response.data.values, null, 2));

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    
    if (error.message.includes("unregistered callers")) {
      console.error("\n⚠️  FIX: Service account is not added to the Google Sheet!");
      console.error("   1. Open your Google Sheet");
      console.error("   2. Click 'Share'");
      console.error("   3. Add this email: " + process.env.GOOGLE_CLIENT_EMAIL);
      console.error("   4. Give EDITOR permissions");
    } else if (error.message.includes("invalid_grant")) {
      console.error("\n⚠️  FIX: Service account key may be invalid or expired!");
      console.error("   1. Go to Google Cloud Console");
      console.error("   2. Create a NEW service account key");
      console.error("   3. Update .env.local with the new key");
    }
    
    console.error("\n📋 Full error:", error);
  }
}

testAuth();
