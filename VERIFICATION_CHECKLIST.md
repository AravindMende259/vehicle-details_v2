# ✅ Verification Checklist

Complete each step and check off the box. This will help you diagnose any issues.

## 📝 Configuration

- [ ] **Step 1**: Updated `.env.local` with correct `GOOGLE_SHEET_ID`
  - [ ] Sheet ID is a long alphanumeric string (not a URL)
  - [ ] Restarted dev server after changing `.env.local`

- [ ] **Step 2**: Service account email shared with Google Sheet
  - [ ] Opened Google Sheet
  - [ ] Clicked "Share" button
  - [ ] Added: `vehicle-sheet-reader@vehicle-next-app.iam.gserviceaccount.com`
  - [ ] Gave **Editor** permissions
  - [ ] Waited 1-2 minutes for permission to take effect

- [ ] **Step 3**: Google Sheets API is enabled
  - [ ] Logged into https://console.cloud.google.com/
  - [ ] Selected project: `vehicle-next-app`
  - [ ] Navigated to **APIs & Services**
  - [ ] Found and enabled **Google Sheets API**
  - [ ] Waited 1-2 minutes for API to activate

## 📊 Google Sheet Format

- [ ] **Sheet name is "Sheet1"** (case-sensitive)
  - [ ] Not "sheet1", "Sheet", or "Sheet 1"

- [ ] **Column Headers in Row 1**:
  - [ ] Column A: "Name"
  - [ ] Column B: "Number"
  - [ ] Column C: "Price"

- [ ] **Data starts in Row 2** (A2:D):
  - [ ] At least one vehicle entry
  - [ ] Each row has 3 columns of data

## 🧪 Testing The Setup

### Local Testing
```bash
# Terminal 1: Start dev server
npm run dev
```

- [ ] **API Endpoint Test**
  ```
  Visit: http://localhost:3000/api/vehicles
  Expected: JSON array with vehicle data
  Actually see: [copy here what you see]
  ```

- [ ] **Frontend Test**
  ```
  Visit: http://localhost:3000
  Expected: Cards displaying vehicle names and prices
  Actually see: [describe what you see]
  ```

- [ ] **Details Page Test**
  ```
  Click any vehicle card
  Expected: Shows vehicle details
  Actually see: [describe what you see]
  ```

## 🔍 Error Diagnosis

If you see errors, check:

### Error: "GOOGLE_SHEET_ID is not set"
- [ ] You modified `.env.local` and added the Sheet ID
- [ ] You saved the file
- [ ] You restarted `npm run dev`

### Error: "Permission denied (403)"
- [ ] Service account email is shared with the sheet
- [ ] Permissions show as "Editor"
- [ ] Wait 2 minutes and try again

### Error: "not found (404)"
- [ ] Check Sheet ID is correct (from URL, not title)
- [ ] Sheet ID is a long alphanumeric string
- [ ] No extra spaces in `.env.local`

### Error: "Invalid credentials"
- [ ] Private key in `.env.local` has `\n` (not actual newlines)
- [ ] No extra quotes around the key
- [ ] Key starts with `-----BEGIN PRIVATE KEY-----`

### Error: "No data found"
- [ ] Sheet has data in rows starting from A2
- [ ] Sheet is named exactly "Sheet1"
- [ ] Data is in columns A, B, C (not different columns)

## 🚀 Success Indicators

You'll know it's working when:

✅ API returns JSON array at `/api/vehicles`  
✅ Homepage shows vehicle cards  
✅ Clicking a card shows vehicle details  
✅ No red error boxes on the page  
✅ Console has no error messages  

---

## 📝 Notes

```
Sheet ID from URL:
[Write your sheet ID here: ___________________]

Service account email:
vehicle-sheet-reader@vehicle-next-app.iam.gserviceaccount.com

Today's date:
[When you completed setup: ___________________]

Any custom notes:
[Write here: _________________________________ ]
```

---

## 🆘 If Still Not Working

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart dev server**: Close and `npm run dev`
3. **Check browser console**: F12 → Console tab for error messages
4. **Check server logs**: Terminal running `npm run dev` shows error logs
5. **Check all 3 requirements**:
   - `.env.local` has correct GOOGLE_SHEET_ID
   - Service account email is shared as Editor
   - Google Sheets API is enabled

Copy any error messages from the red box on the homepage or console logs here:
```
[Paste error here]
```

This will help identify the exact issue! 🔍
