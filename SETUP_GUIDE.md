# Google Sheets API Setup Guide

## ✅ Completed:
- Updated `.env.local` with correct service account credentials
- Improved API error handling in `/src/app/api/vehicles/route.js`

## 🔧 You Need To Do:

### 1. **Replace the Google Sheet ID**
Edit `.env.local` and replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Google Sheet ID.

The Sheet ID is found in the Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
```

Example:
```
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
```

### 2. **Add Service Account as Editor**
Go to your Google Sheet and share it with this email:
```
vehicle-sheet-reader@vehicle-next-app.iam.gserviceaccount.com
```
- Click "Share"
- Add the email above
- Give **Editor** permissions
- Click "Share"

### 3. **Verify Google Sheets API is Enabled**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `vehicle-next-app`
3. Go to "APIs & Services" → "Enabled APIs & services"
4. Search for "Google Sheets API"
5. If not enabled, click Enable

### 4. **Verify Your Sheet Format**
Make sure your Google Sheet has data in this format:
```
Row 1: Headers (Name | Number | Price)
Row 2: Toyota | TN 01 AB 1234 | 8,00,000
Row 3: Honda | TN 02 CD 5678 | 9,50,000
```

The API reads from `Sheet1` columns A:D starting at row 2 (A2:D).

### 5. **Test the API**
After completing steps 1-4:
1. Restart your development server: `npm run dev`
2. Open browser to `http://localhost:3000/api/vehicles`
3. You should see JSON data from your Google Sheet

## 🐛 If You Still Get Errors:

### Error: "GOOGLE_SHEET_ID is not set"
- Make sure you replaced `YOUR_GOOGLE_SHEET_ID_HERE` in `.env.local`
- Restart the dev server after editing `.env.local`

### Error: "Permission denied" (403)
- Service account email isn't added to the sheet as Editor
- Re-share the sheet with the service account email

### Error: "not found" (404)
- Check the GOOGLE_SHEET_ID is correct
- Sheet ID format should be a long alphanumeric string

### Error: "Invalid credentials"
- The private key might be malformed
- Check that `.env.local` has the correct key with proper escape sequences (\n)

## 📝 Environment Variables Reference
- `GOOGLE_CLIENT_EMAIL`: Service account email (already set ✅)
- `GOOGLE_PRIVATE_KEY`: Private key from service account (already set ✅)
- `GOOGLE_SHEET_ID`: Your Google Sheet ID (YOU NEED TO SET THIS ⚠️)

---

After completing all steps, your frontend at `http://localhost:3000` will display the vehicle cards fetched from Google Sheets!
