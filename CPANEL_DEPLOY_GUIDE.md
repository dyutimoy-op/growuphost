# 🚀 How to Host GrowUpHost on cPanel (Node.js App)

This project is configured to run smoothly on **cPanel Node.js Selector / Phusion Passenger**.

---

## 📁 Key Files Created for cPanel

1. **`app.js`** _(Recommended)_:
   The main cPanel application startup file. Automatically reads `process.env.PORT` provided by cPanel Passenger and boots the standalone production server.
2. **`server.js`**:
   An alias for `app.js` (in case your cPanel setup asks for `server.js`).
3. **`.output/`**:
   The complete pre-built production bundle (both client SSR assets and standalone Node server).
   > **Note:** Because `.output/` is already built, **you do not need to run heavy build commands on cPanel**, preventing out-of-memory errors on shared hosting!

---

## 📋 Step-by-Step cPanel Setup Instructions

### Step 1: Upload the Files to cPanel

1. Select all files and folders inside `hosting-company-cpanel-deploy`.
2. Create a zip archive (e.g. `growuphost.zip`).
3. Log in to your **cPanel** dashboard.
4. Open **File Manager** and upload `growuphost.zip` to:
   - `public_html/` (if this is your primary domain), **OR**
   - A dedicated folder like `growuphost/` (or your subdomain folder).
5. Extract the zip archive in that directory. Ensure hidden files (like `.env` and `.output`) are extracted.

---

### Step 2: Open "Setup Node.js App" in cPanel

1. In cPanel, search for **"Setup Node.js App"** (or **"Node.js Selector"**).
2. Click **"Create Application"** (or "+ Create Application" button).

---

### Step 3: Configure the Application Settings

Fill in the form with the following values:

| Field                        | Setting / Value                      | Notes                              |
| ---------------------------- | ------------------------------------ | ---------------------------------- |
| **Node.js version**          | **20.x** (or **22.x** / **18.x**)    | Recommended: 20 or 22              |
| **Application mode**         | **Production**                       | Runs optimized production bundle   |
| **Application root**         | `public_html` (or your upload path)  | Where `app.js` and `.output/` live |
| **Application URL**          | Your domain (e.g., `growuphost.com`) | Select your website domain         |
| **Application startup file** | `app.js`                             | (or `server.js`)                   |

---

### Step 4: Environment Variables (Optional)

The `.env` file is already included in your directory. If you prefer to set them in cPanel UI:

- `PORT` &rarr; Handled automatically by cPanel.
- `NODE_ENV` &rarr; `production`

---

### Step 5: Start the Application

1. Click **"CREATE"** in the top right.
2. Click **"START APP"** (or **"Restart"** if it was already created).
3. Visit your website domain in your browser — your GrowUpHost landing page and admin panel are live!

---

## 🛠️ Testing Locally Before Upload

To test this standalone build on your local machine:

```bash
node app.js
```

Then open `http://localhost:3000` in your browser.
