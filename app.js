const STORAGE_KEY = "product-scanner-table-v1";

const defaultColumns = [
  "Code",
  "Model",
  "IMEI",
  "Storage",
  "Grade",
  "Battery Life",
  "Week",
  "Buying Price",
  "Selling Price",
];

const storageOptions = ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const gradeOptions = ["A", "B", "C"];
const batteryLifeOptions = ["100%", "95%", "90%", "85%", "80%", "<80"];
const weekOptions = Array.from({ length: 52 }, (_, index) => String(index + 1));

let state = createDefaultState();
let saveTimer = null;
let usingPythonStorage = false;
let searchTerm = "";

const elements = {
  scanInput: document.querySelector("#scanInput"),
  scanFocus: document.querySelector("#scanFocus"),
  addScan: document.querySelector("#addScan"),
  exportCsv: document.querySelector("#exportCsv"),
  clearRows: document.querySelector("#clearRows"),
  tableHead: document.querySelector("#tableHead"),
  tableBody: document.querySelector("#tableBody"),
  emptyState: document.querySelector("#emptyState"),
  newColumnName: document.querySelector("#newColumnName"),
  addColumn: document.querySelector("#addColumn"),
  columnList: document.querySelector("#columnList"),
  cameraToggle: document.querySelector("#cameraToggle"),
  cameraPanel: document.querySelector("#cameraPanel"),
  cameraPreview: document.querySelector("#cameraPreview"),
  cameraStatus: document.querySelector("#cameraStatus"),
  openSettings: document.querySelector("#openSettings"),
  closeSettings: document.querySelector("#closeSettings"),
  settingsModal: document.querySelector("#settingsModal"),
};

let cameraStream = null;
let scanTimer = null;
let lastCameraCode = "";
let lastCameraCodeAt = 0;

initialize();
focusScanInput();

elements.addScan.addEventListener("click", addFromScanInput);
elements.scanFocus.addEventListener("click", focusScanInput);
elements.scanInput.addEventListener("input", () => {
  searchTerm = elements.scanInput.value.trim().toLowerCase();
  renderTable();
});
elements.scanInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addFromScanInput();
  }
});

elements.exportCsv.addEventListener("click", exportCsv);
elements.clearRows.addEventListener("click", clearRows);
elements.addColumn.addEventListener("click", addColumn);
elements.newColumnName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addColumn();
  }
});
elements.cameraToggle.addEventListener("click", toggleCameraScanner);
elements.openSettings.addEventListener("click", openSettings);
elements.closeSettings.addEventListener("click", closeSettings);
elements.settingsModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-settings")) {
    closeSettings();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.settingsModal.classList.contains("hidden")) {
    closeSettings();
  }
});

async function initialize() {
  state = await loadState();
  render();
}

function createDefaultState() {
  return {
    columns: defaultColumns.map((name) => ({ id: createId(), name, visible: true })),
    rows: [],
  };
}

async function loadState() {
  if (location.protocol !== "file:") {
    try {
      const response = await fetch("/api/state");
      if (response.ok) {
        const saved = await response.json();
        if (isValidState(saved)) {
          usingPythonStorage = true;
          return saved;
        }
      }
    } catch {
      usingPythonStorage = false;
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (isValidState(saved)) {
      return saved;
    }
  } catch {
  }

  return createDefaultState();
}

function saveState() {
  if (!usingPythonStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return;
  }

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        throw new Error("Save failed");
      }
    } catch {
      usingPythonStorage = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, 150);
}

function render() {
  renderColumns();
  renderTable();
  saveState();
}

function renderColumns() {
  elements.columnList.replaceChildren();

  state.columns.forEach((column, index) => {
    const item = document.createElement("div");
    item.className = "column-item";

    const nameInput = document.createElement("input");
    nameInput.value = column.name;
    nameInput.setAttribute("aria-label", `Rename ${column.name}`);
    nameInput.addEventListener("input", () => {
      column.name = nameInput.value.trimStart();
      renderTable();
      saveState();
    });

    const visibleLabel = document.createElement("label");
    const visibleCheckbox = document.createElement("input");
    visibleCheckbox.type = "checkbox";
    visibleCheckbox.checked = column.visible;
    visibleCheckbox.addEventListener("change", () => {
      column.visible = visibleCheckbox.checked;
      render();
    });
    visibleLabel.append(visibleCheckbox, "Visible");

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.textContent = "Remove";
    removeButton.disabled = state.columns.length === 1;
    removeButton.addEventListener("click", () => {
      removeColumn(index);
    });

    item.append(nameInput, visibleLabel, removeButton);
    elements.columnList.append(item);
  });
}

function renderTable() {
  const visibleColumns = state.columns.filter((column) => column.visible);
  const visibleRows = getVisibleRows(visibleColumns);
  elements.tableHead.replaceChildren();
  elements.tableBody.replaceChildren();
  elements.emptyState.classList.toggle("hidden", visibleRows.length > 0);
  elements.emptyState.textContent = state.rows.length
    ? "No saved products match this search."
    : "No products saved yet. Scan a code to create the first row.";

  const headerRow = document.createElement("tr");
  visibleColumns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.name || "Untitled";
    headerRow.append(th);
  });
  const actionsHeader = document.createElement("th");
  actionsHeader.textContent = "Actions";
  headerRow.append(actionsHeader);
  elements.tableHead.append(headerRow);

  visibleRows.forEach(({ row, rowIndex }) => {
    const tr = document.createElement("tr");

    visibleColumns.forEach((column) => {
      const td = document.createElement("td");
      td.append(createCellEditor(column, row, rowIndex));
      tr.append(td);
    });

    const actions = document.createElement("td");
    actions.className = "actions-cell";

    const duplicateButton = document.createElement("button");
    duplicateButton.type = "button";
    duplicateButton.className = "row-action duplicate";
    duplicateButton.textContent = "Duplicate";
    duplicateButton.addEventListener("click", () => {
      state.rows.splice(rowIndex + 1, 0, { ...row });
      render();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "row-action delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      state.rows.splice(rowIndex, 1);
      render();
    });

    actions.append(duplicateButton, deleteButton);
    tr.append(actions);
    elements.tableBody.append(tr);
  });
}

function createCellEditor(column, row, rowIndex) {
  if (isStorageColumn(column)) {
    return createSelectEditor(column, row, rowIndex, storageOptions);
  }

  if (isGradeColumn(column)) {
    return createSelectEditor(column, row, rowIndex, gradeOptions);
  }

  if (isBatteryLifeColumn(column)) {
    return createSelectEditor(column, row, rowIndex, batteryLifeOptions);
  }

  if (isWeekColumn(column)) {
    return createSelectEditor(column, row, rowIndex, weekOptions);
  }

  const input = document.createElement("input");
  input.value = row[column.id] || "";
  input.setAttribute("aria-label", `${column.name} row ${rowIndex + 1}`);
  input.addEventListener("input", () => {
    row[column.id] = input.value;
    saveState();
  });
  return input;
}

function createSelectEditor(column, row, rowIndex, options) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", `${column.name} row ${rowIndex + 1}`);

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "";
  select.append(emptyOption);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.append(item);
  });

  select.value = options.includes(row[column.id]) ? row[column.id] : "";
  select.addEventListener("change", () => {
    row[column.id] = select.value;
    saveState();
  });
  return select;
}

function isStorageColumn(column) {
  return column.name.trim().toLowerCase() === "storage";
}

function isGradeColumn(column) {
  return column.name.trim().toLowerCase() === "grade";
}

function isBatteryLifeColumn(column) {
  return column.name.trim().toLowerCase() === "battery life";
}

function isWeekColumn(column) {
  return column.name.trim().toLowerCase() === "week";
}

function addFromScanInput() {
  const code = elements.scanInput.value.trim();
  if (!code) {
    focusScanInput();
    return;
  }

  addScannedCode(code);
  elements.scanInput.value = "";
  searchTerm = "";
  focusScanInput();
}

function addScannedCode(code) {
  const row = {};
  const codeColumn = findColumn("Code") || state.columns[0];
  row[codeColumn.id] = code;
  state.rows.unshift(row);
  render();
}

function addColumn() {
  const name = elements.newColumnName.value.trim();
  if (!name) {
    elements.newColumnName.focus();
    return;
  }

  state.columns.push({ id: createId(), name, visible: true });
  elements.newColumnName.value = "";
  render();
}

function removeColumn(index) {
  const [removed] = state.columns.splice(index, 1);
  state.rows.forEach((row) => {
    delete row[removed.id];
  });
  render();
}

function clearRows() {
  if (!state.rows.length) {
    return;
  }

  const confirmed = window.confirm("Clear all saved rows? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  state.rows = [];
  render();
}

function exportCsv() {
  const visibleColumns = state.columns.filter((column) => column.visible);
  const header = visibleColumns.map((column) => column.name || "Untitled");
  const rows = state.rows.map((row) => visibleColumns.map((column) => row[column.id] || ""));
  const csv = [header, ...rows].map((values) => values.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `product-scans-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  focusScanInput();
}

function escapeCsv(value) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function findColumn(name) {
  return state.columns.find((column) => column.name.toLowerCase() === name.toLowerCase());
}

function getVisibleRows(visibleColumns) {
  if (!searchTerm) {
    return state.rows.map((row, rowIndex) => ({ row, rowIndex }));
  }

  return state.rows
    .map((row, rowIndex) => ({ row, rowIndex }))
    .filter(({ row }) =>
      visibleColumns.some((column) => String(row[column.id] || "").toLowerCase().includes(searchTerm)),
    );
}

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidState(value) {
  return value && Array.isArray(value.columns) && Array.isArray(value.rows);
}

function focusScanInput() {
  window.setTimeout(() => elements.scanInput.focus(), 0);
}

function openSettings() {
  elements.settingsModal.classList.remove("hidden");
  elements.newColumnName.focus();
}

function closeSettings() {
  elements.settingsModal.classList.add("hidden");
  focusScanInput();
}

async function toggleCameraScanner() {
  if (cameraStream) {
    stopCameraScanner();
    return;
  }

  if (!("BarcodeDetector" in window)) {
    elements.cameraPanel.classList.remove("hidden");
    elements.cameraStatus.textContent =
      "Camera barcode scanning is not supported by this browser. USB scanner input still works.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    elements.cameraPreview.srcObject = cameraStream;
    await elements.cameraPreview.play();
    elements.cameraPanel.classList.remove("hidden");
    elements.cameraToggle.textContent = "Stop Camera";
    elements.cameraStatus.textContent = "Point the camera at a barcode or QR code.";
    scanWithCamera();
  } catch (error) {
    elements.cameraPanel.classList.remove("hidden");
    elements.cameraStatus.textContent = `Camera could not start: ${error.message}`;
    stopCameraScanner();
  }
}

function stopCameraScanner() {
  window.clearTimeout(scanTimer);
  scanTimer = null;
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }
  cameraStream = null;
  elements.cameraPreview.srcObject = null;
  elements.cameraToggle.textContent = "Camera Scan";
}

async function scanWithCamera() {
  if (!cameraStream) {
    return;
  }

  try {
    const detector = new BarcodeDetector({
      formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "itf"],
    });
    const codes = await detector.detect(elements.cameraPreview);
    const value = codes[0]?.rawValue?.trim();
    const now = Date.now();

    if (value && (value !== lastCameraCode || now - lastCameraCodeAt > 2500)) {
      lastCameraCode = value;
      lastCameraCodeAt = now;
      addScannedCode(value);
      elements.cameraStatus.textContent = `Scanned: ${value}`;
    }
  } catch (error) {
    elements.cameraStatus.textContent = `Camera scanner error: ${error.message}`;
  }

  scanTimer = window.setTimeout(scanWithCamera, 350);
}
