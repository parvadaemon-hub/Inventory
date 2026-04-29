# Product Scanner Table

A small Python-powered local web app for saving barcode or QR scan results into an editable table.

## Use It

Open this URL while the local server is running:

```text
http://localhost:8080
```

For USB or Bluetooth handheld scanners, click the scanner input field and scan. Most scanners type the code and press Enter, so a new row is added automatically.

## Columns

The starting columns are:

```text
Code, Model, IMEI, Storage, Grade, Battery Life, Week, Buying Price, Selling Price
```

You can rename, hide, remove, and add columns from the Columns panel. When opened through the Python server, data is saved to `scanner-data.json` in this folder.

## Export

Use **Export CSV** to download the visible table columns as a CSV file.

## Start Again Later

From this folder, run:

```powershell
& 'C:\Users\Nikki\AppData\Local\Python\bin\python.exe' scanner_app.py
```

Then open `http://localhost:8080`.
