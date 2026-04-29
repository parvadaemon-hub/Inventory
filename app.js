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
<<<<<<< HEAD
=======
const datasetOptions = ["SCAL", "JAPAN", "REFURBLY", "VISTA"];
>>>>>>> dropdown-menu-and-visual-changes

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
<<<<<<< HEAD
=======
  datasetSelect: document.querySelector("#datasetSelect"),
>>>>>>> dropdown-menu-and-visual-changes
  newColumnName: document.querySelector("#newColumnName"),
  addColumn: document.querySelector("#addColumn"),
  columnList: document.querySelector("#columnList"),
  cameraToggle: document.querySelector("#cameraToggle"),
  cameraPanel: document.querySelector("#cameraPanel"),
  cameraPreview: document.querySelector("#cameraPreview"),
  cameraStatus: document.querySelector("#cameraStatus"),
<<<<<<< HEAD
=======
  menuToggle: document.querySelector("#menuToggle"),
  mainMenu: document.querySelector("#mainMenu"),
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
=======
elements.datasetSelect.addEventListener("change", () => {
  state.activeDataset = elements.datasetSelect.value;
  searchTerm = "";
  elements.scanInput.value = "";
  ensureDatasetRows();
  renderTable();
  saveState();
  focusScanInput();
});
>>>>>>> dropdown-menu-and-visual-changes
elements.addColumn.addEventListener("click", addColumn);
elements.newColumnName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addColumn();
  }
});
elements.cameraToggle.addEventListener("click", toggleCameraScanner);
<<<<<<< HEAD
=======
elements.menuToggle.addEventListener("click", toggleMainMenu);
elements.mainMenu.addEventListener("click", closeMainMenu);
>>>>>>> dropdown-menu-and-visual-changes
elements.openSettings.addEventListener("click", openSettings);
elements.closeSettings.addEventListener("click", closeSettings);
elements.settingsModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-settings")) {
    closeSettings();
  }
});
document.addEventListener("keydown", (event) => {
<<<<<<< HEAD
=======
  if (event.key === "Escape") {
    closeMainMenu();
  }
>>>>>>> dropdown-menu-and-visual-changes
  if (event.key === "Escape" && !elements.settingsModal.classList.contains("hidden")) {
    closeSettings();
  }
});
<<<<<<< HEAD
=======
document.addEventListener("click", (event) => {
  if (!elements.mainMenu.classList.contains("hidden") && !event.target.closest(".menu-wrap")) {
    closeMainMenu();
  }
});
>>>>>>> dropdown-menu-and-visual-changes

async function initialize() {
  state = await loadState();
  render();
}

function createDefaultState() {
  return {
    columns: defaultColumns.map((name) => ({ id: createId(), name, visible: true })),
<<<<<<< HEAD
    rows: [],
=======
    activeDataset: datasetOptions[0],
    datasets: createEmptyDatasets(),
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
          return saved;
=======
          return normalizeState(saved);
>>>>>>> dropdown-menu-and-visual-changes
        }
      }
    } catch {
      usingPythonStorage = false;
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (isValidState(saved)) {
<<<<<<< HEAD
      return saved;
=======
      return normalizeState(saved);
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
=======
  renderDatasetSelector();
>>>>>>> dropdown-menu-and-visual-changes
  renderColumns();
  renderTable();
  saveState();
}

<<<<<<< HEAD
=======
function renderDatasetSelector() {
  elements.datasetSelect.replaceChildren();
  datasetOptions.forEach((dataset) => {
    const option = document.createElement("option");
    option.value = dataset;
    option.textContent = dataset;
    elements.datasetSelect.append(option);
  });
  elements.datasetSelect.value = state.activeDataset;
}

>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
  elements.tableHead.replaceChildren();
  elements.tableBody.replaceChildren();
  elements.emptyState.classList.toggle("hidden", visibleRows.length > 0);
  elements.emptyState.textContent = state.rows.length
    ? "No saved products match this search."
    : "No products saved yet. Scan a code to create the first row.";
=======
  const rows = getCurrentRows();
  elements.tableHead.replaceChildren();
  elements.tableBody.replaceChildren();
  elements.emptyState.classList.toggle("hidden", visibleRows.length > 0);
  elements.emptyState.textContent = rows.length
    ? "No saved products match this search."
    : `No products saved in ${state.activeDataset} yet. Scan a code to create the first row.`;
>>>>>>> dropdown-menu-and-visual-changes

  const headerRow = document.createElement("tr");
  visibleColumns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.name || "Untitled";
<<<<<<< HEAD
=======
    if (shouldAlignRight(column)) {
      th.classList.add("align-right");
    }
>>>>>>> dropdown-menu-and-visual-changes
    headerRow.append(th);
  });
  const actionsHeader = document.createElement("th");
  actionsHeader.textContent = "Actions";
<<<<<<< HEAD
=======
  actionsHeader.classList.add("actions-header");
>>>>>>> dropdown-menu-and-visual-changes
  headerRow.append(actionsHeader);
  elements.tableHead.append(headerRow);

  visibleRows.forEach(({ row, rowIndex }) => {
    const tr = document.createElement("tr");

    visibleColumns.forEach((column) => {
      const td = document.createElement("td");
<<<<<<< HEAD
=======
      if (shouldAlignRight(column)) {
        td.classList.add("align-right");
      }
>>>>>>> dropdown-menu-and-visual-changes
      td.append(createCellEditor(column, row, rowIndex));
      tr.append(td);
    });

    const actions = document.createElement("td");
    actions.className = "actions-cell";

    const duplicateButton = document.createElement("button");
    duplicateButton.type = "button";
    duplicateButton.className = "row-action duplicate";
<<<<<<< HEAD
    duplicateButton.textContent = "Duplicate";
    duplicateButton.addEventListener("click", () => {
      state.rows.splice(rowIndex + 1, 0, { ...row });
=======
    duplicateButton.textContent = "⧉";
    duplicateButton.title = "Duplicate";
    duplicateButton.setAttribute("aria-label", `Duplicate row ${rowIndex + 1}`);
    duplicateButton.addEventListener("click", () => {
      getCurrentRows().splice(rowIndex + 1, 0, { ...row });
>>>>>>> dropdown-menu-and-visual-changes
      render();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "row-action delete";
<<<<<<< HEAD
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      state.rows.splice(rowIndex, 1);
=======
    deleteButton.textContent = "×";
    deleteButton.title = "Delete";
    deleteButton.setAttribute("aria-label", `Delete row ${rowIndex + 1}`);
    deleteButton.addEventListener("click", () => {
      getCurrentRows().splice(rowIndex, 1);
>>>>>>> dropdown-menu-and-visual-changes
      render();
    });

    actions.append(duplicateButton, deleteButton);
    tr.append(actions);
    elements.tableBody.append(tr);
  });
}

function createCellEditor(column, row, rowIndex) {
  if (isStorageColumn(column)) {
<<<<<<< HEAD
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
=======
    return createSelectEditor(column, row, rowIndex, storageOptions, { minCharacters: 9, extraCharacters: 5 });
  }

  if (isGradeColumn(column)) {
    return createSelectEditor(column, row, rowIndex, gradeOptions, { minCharacters: 4, extraCharacters: 5 });
  }

  if (isBatteryLifeColumn(column)) {
    return createSelectEditor(column, row, rowIndex, batteryLifeOptions, { minCharacters: 7, extraCharacters: 5 });
  }

  if (isWeekColumn(column)) {
    return createSelectEditor(column, row, rowIndex, weekOptions, { minCharacters: 5, extraCharacters: 5 });
>>>>>>> dropdown-menu-and-visual-changes
  }

  const input = document.createElement("input");
  input.value = row[column.id] || "";
  input.setAttribute("aria-label", `${column.name} row ${rowIndex + 1}`);
<<<<<<< HEAD
  input.addEventListener("input", () => {
    row[column.id] = input.value;
=======
  fitEditorToContent(input);
  input.addEventListener("input", () => {
    row[column.id] = input.value;
    fitEditorToContent(input);
>>>>>>> dropdown-menu-and-visual-changes
    saveState();
  });
  return input;
}

<<<<<<< HEAD
function createSelectEditor(column, row, rowIndex, options) {
=======
function createSelectEditor(column, row, rowIndex, options, fitOptions = {}) {
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
  select.addEventListener("change", () => {
    row[column.id] = select.value;
=======
  fitEditorToContent(select, fitOptions);
  select.addEventListener("change", () => {
    row[column.id] = select.value;
    fitEditorToContent(select, fitOptions);
>>>>>>> dropdown-menu-and-visual-changes
    saveState();
  });
  return select;
}

<<<<<<< HEAD
=======
function fitEditorToContent(editor, options = {}) {
  const value = editor.value || "";
  const placeholder = editor.getAttribute("placeholder") || "";
  const contentLength = Math.max(value.length, placeholder.length, options.minCharacters || 3);
  editor.style.width = `${contentLength + (options.extraCharacters || 2)}ch`;
}

>>>>>>> dropdown-menu-and-visual-changes
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

<<<<<<< HEAD
function addFromScanInput() {
=======
function shouldAlignRight(column) {
  const imeiIndex = state.columns.findIndex((item) => item.name.trim().toLowerCase() === "imei");
  const columnIndex = state.columns.findIndex((item) => item.id === column.id);
  return imeiIndex >= 0 && columnIndex > imeiIndex;
}

async function addFromScanInput() {
>>>>>>> dropdown-menu-and-visual-changes
  const code = elements.scanInput.value.trim();
  if (!code) {
    focusScanInput();
    return;
  }

<<<<<<< HEAD
  addScannedCode(code);
=======
  await handleScan(code);
>>>>>>> dropdown-menu-and-visual-changes
  elements.scanInput.value = "";
  searchTerm = "";
  focusScanInput();
}

<<<<<<< HEAD
=======
async function handleScan(code) {
  const res = await fetch(`/api/products/${encodeURIComponent(code)}`);
  const data = await res.json();

  if (data.exists) {
    showProduct(data.product);
  } else {
    showCreateForm(code);
  }
}

function showProduct(product) {
  if (product.dataset && datasetOptions.includes(product.dataset)) {
    state.activeDataset = product.dataset;
    elements.datasetSelect.value = product.dataset;
  }
  renderTable();
}

function showCreateForm(code) {
  addScannedCode(code);
}

>>>>>>> dropdown-menu-and-visual-changes
function addScannedCode(code) {
  const row = {};
  const codeColumn = findColumn("Code") || state.columns[0];
  row[codeColumn.id] = code;
<<<<<<< HEAD
  state.rows.unshift(row);
=======
  getCurrentRows().unshift(row);
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
  state.rows.forEach((row) => {
    delete row[removed.id];
=======
  Object.values(state.datasets).forEach((rows) => {
    rows.forEach((row) => {
      delete row[removed.id];
    });
>>>>>>> dropdown-menu-and-visual-changes
  });
  render();
}

function clearRows() {
<<<<<<< HEAD
  if (!state.rows.length) {
    return;
  }

  const confirmed = window.confirm("Clear all saved rows? This cannot be undone.");
=======
  const rows = getCurrentRows();
  if (!rows.length) {
    return;
  }

  const confirmed = window.confirm(`Clear all saved rows in ${state.activeDataset}? This cannot be undone.`);
>>>>>>> dropdown-menu-and-visual-changes
  if (!confirmed) {
    return;
  }

<<<<<<< HEAD
  state.rows = [];
=======
  state.datasets[state.activeDataset] = [];
>>>>>>> dropdown-menu-and-visual-changes
  render();
}

function exportCsv() {
  const visibleColumns = state.columns.filter((column) => column.visible);
  const header = visibleColumns.map((column) => column.name || "Untitled");
<<<<<<< HEAD
  const rows = state.rows.map((row) => visibleColumns.map((column) => row[column.id] || ""));
=======
  const rows = getCurrentRows().map((row) => visibleColumns.map((column) => row[column.id] || ""));
>>>>>>> dropdown-menu-and-visual-changes
  const csv = [header, ...rows].map((values) => values.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
<<<<<<< HEAD
  link.download = `product-scans-${new Date().toISOString().slice(0, 10)}.csv`;
=======
  link.download = `${state.activeDataset.toLowerCase()}-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
  if (!searchTerm) {
    return state.rows.map((row, rowIndex) => ({ row, rowIndex }));
  }

  return state.rows
=======
  const rows = getCurrentRows();
  if (!searchTerm) {
    return rows.map((row, rowIndex) => ({ row, rowIndex }));
  }

  return rows
>>>>>>> dropdown-menu-and-visual-changes
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
<<<<<<< HEAD
  return value && Array.isArray(value.columns) && Array.isArray(value.rows);
=======
  return value && Array.isArray(value.columns) && (Array.isArray(value.rows) || isDatasetMap(value.datasets));
}

function normalizeState(value) {
  const normalized = {
    columns: value.columns,
    activeDataset: datasetOptions.includes(value.activeDataset) ? value.activeDataset : datasetOptions[0],
    datasets: createEmptyDatasets(),
  };

  if (isDatasetMap(value.datasets)) {
    datasetOptions.forEach((dataset) => {
      normalized.datasets[dataset] = Array.isArray(value.datasets[dataset]) ? value.datasets[dataset] : [];
    });
  } else if (Array.isArray(value.rows)) {
    normalized.datasets[datasetOptions[0]] = value.rows;
  }

  return normalized;
}

function createEmptyDatasets() {
  return Object.fromEntries(datasetOptions.map((dataset) => [dataset, []]));
}

function isDatasetMap(value) {
  return value && typeof value === "object" && datasetOptions.some((dataset) => Array.isArray(value[dataset]));
}

function ensureDatasetRows() {
  if (!state.datasets || typeof state.datasets !== "object") {
    state.datasets = createEmptyDatasets();
  }
  datasetOptions.forEach((dataset) => {
    if (!Array.isArray(state.datasets[dataset])) {
      state.datasets[dataset] = [];
    }
  });
  if (!datasetOptions.includes(state.activeDataset)) {
    state.activeDataset = datasetOptions[0];
  }
}

function getCurrentRows() {
  ensureDatasetRows();
  return state.datasets[state.activeDataset];
>>>>>>> dropdown-menu-and-visual-changes
}

function focusScanInput() {
  window.setTimeout(() => elements.scanInput.focus(), 0);
}

function openSettings() {
<<<<<<< HEAD
=======
  closeMainMenu();
>>>>>>> dropdown-menu-and-visual-changes
  elements.settingsModal.classList.remove("hidden");
  elements.newColumnName.focus();
}

function closeSettings() {
  elements.settingsModal.classList.add("hidden");
  focusScanInput();
}

<<<<<<< HEAD
=======
function toggleMainMenu() {
  const isOpen = !elements.mainMenu.classList.contains("hidden");
  elements.mainMenu.classList.toggle("hidden", isOpen);
  elements.menuToggle.setAttribute("aria-expanded", String(!isOpen));
}

function closeMainMenu() {
  elements.mainMenu.classList.add("hidden");
  elements.menuToggle.setAttribute("aria-expanded", "false");
}

>>>>>>> dropdown-menu-and-visual-changes
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
