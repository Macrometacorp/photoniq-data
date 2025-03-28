# 📦 photoniq-data

`photoniq-data` is an automated data synchronization utility that fetches remote data files via URLs, tracks their versioning, and optionally commits updates to a GitHub repository. It supports both local development and GitHub Actions for scheduled or manual runs.

---

## 🚀 Features

- Download data files from predefined URLs.
- Track versions in a `version.json` file.
- Schedule automatic daily downloads with GitHub Actions.
- Commit updated data files automatically if changes are detected.
- Local development support with Node.js.

---

## ⚙️ Prerequisites

- **Node.js v20+** and **npm** installed.
  > ℹ️ Recommended: Use [`volta`](https://volta.sh) to manage Node.js versions.

- Set an environment variable `DOWNLOAD_ITEMS` as a JSON string containing file name to URL mappings.

```bash
export DOWNLOAD_ITEMS='{
  "example.csv": "https://example.com/data.csv",
  "sample.json": "https://example.com/sample.json"
}'
```

---

## 🧪 Running Locally

```bash
npm install         # Install dependencies
node index.js       # Run the downloader
```

This will:
- Read existing versions from `data/version.json` (or create it if missing).
- Download files defined in `DOWNLOAD_ITEMS`.
- Write new/updated versions back to `version.json`.

---

## 🚀 GitHub Action: Automated Downloads

The project includes a GitHub Actions workflow (`.github/workflows/run.yaml`) that:

- Runs **daily at 00:00 UTC**, or on **manual dispatch**.
- Downloads files defined in `secrets.DOWNLOAD_ITEMS`.
- Commits any changes to the `data/` folder.

### 🔐 Setup

1. In your GitHub repository, go to **Settings > Secrets and variables > Actions > Secrets**.
2. Create a new secret named `DOWNLOAD_ITEMS` with the same JSON string as shown above.

### 📝 Notes

- Only files inside the `data/` folder are version-tracked.
- If a download fails, the existing version is preserved.

---

## 📦 Building for Deployment

To prepare for deployment (e.g., when used as a GitHub Action), run:

```bash
npm run build
```

Be sure to **commit the updated build output** if any changes are made.

---

## 🧾 Example Version File (`data/version.json`)

```json
{
  "example.csv": "2024-03-27T00:00:00.000Z",
  "sample.json": "2024-03-27T00:00:00.000Z"
}
```

Each entry represents the last successful download timestamp for the corresponding file.

---

## 🛠️ Troubleshooting

- `core.setFailed("Could not get 'downloadItems'")`  
  → Ensure `DOWNLOAD_ITEMS` is set and valid JSON.

- Errors reading `version.json`  
  → Will fallback to an empty object and create a new file if needed.
