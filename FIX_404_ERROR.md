# 🔧 Fixing 404 Error - Diagnostic Steps

## Step 1: Restart Dev Server
First, restart your development server to apply the updates:

```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

## Step 2: Check the Error Message
Open your browser console (F12) and go to:
**http://localhost:3000/api/vehicles**

You'll see the full error message. Common errors:

### Error 1: "Google Sheet not found"
❌ **Problem:** Sheet ID is wrong or sheet doesn't exist
✅ **Fix:** 
1. Open your Google Sheet
2. Copy the full Sheet ID from URL: `https://docs.google.com/spreadsheets/d/[COPY_THIS]/edit`
3. Update `.env.local` with correct `GOOGLE_SHEET_ID`
4. Restart dev server

### Error 2: "Service account is not added to the Google Sheet"
❌ **Problem:** Service account email not shared with document
✅ **Fix:**
1. Open your Google Sheet
2. Click **Share** (top right)
3. Add email: `vehicle-sheet-reader@vehicle-next-app.iam.gserviceaccount.com`
4. Give **Editor** permissions
5. Click **Share** ✅
6. Wait 2-3 minutes for permissions to activate
7. Try refreshing your browser

### Error 3: "Private key may be invalid or expired"
❌ **Problem:** Service account key is expired
✅ **Fix:**
1. Go to https://console.cloud.google.com/
2. Select project: **vehicle-next-app**
3. Go to **APIs & Services** → **Credentials**
4. Find your Service Account
5. Go to **Keys** tab
6. Delete the old key
7. Create a **NEW** key (JSON format)
8. Copy the new private key and update `.env.local`
9. Restart dev server

## Step 3: Verify Sheet Format
Make sure your Google Sheet has:
- Sheet name: **Sheet1** (exact name)
- Row 1: Column headers
- Row 2+: Vehicle rows

Example format:
```
Serial No | Brand | RC | NOC | Bank Address | Vehicle No | Vehicle Model | Year | Engine No | KM Driven | Chassis No | Customer Name | ... | Total Vehicle Price | Sale Price | Balance | Total Paid | Notes | Received
1         | ...   | ...| ... | ...          | TN01...    | ...           | 2020 | ...       | 45000     | ...        | ...           | ... | 820000             | 900000     | 80000   | 200000     | ...   | ...
```

## Step 4: Check Server Logs
Look at your terminal where you ran `npm run dev`. The error logs will show:
- API Error Message
- Full Error details

Copy this information if you need help!

## Quick Test
After fixing, test the API directly:
- Visit: **http://localhost:3000/api/vehicles**
- Should see JSON array with vehicle data
- If you see error, it shows exactly what's wrong ✅

---

## 📋 Checklist
- [ ] Restarted dev server
- [ ] Checked error message on `/api/vehicles`
- [ ] Verified Sheet ID is correct
- [ ] Verified service account is shared with Editor permissions
- [ ] Verified sheet data is in columns A, B, C
- [ ] Waited 2-3 minutes for permissions to activate
- [ ] Refreshed browser (Ctrl+F5)

If still having issues, share the error message from `/api/vehicles` endpoint!
