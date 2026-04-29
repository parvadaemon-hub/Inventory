from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
from urllib.parse import unquote
import uuid


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "scanner-data.json"
PORT = int(os.environ.get("PORT", "8080"))

DEFAULT_COLUMNS = [
    "Code",
    "Model",
    "IMEI",
    "Storage",
    "Grade",
    "Battery Life",
    "Week",
    "Buying Price",
    "Selling Price",
]

DEFAULT_DATASETS = ["SCAL", "JAPAN", "REFURBLY", "VISTA"]


def default_state():
    return {
        "columns": [
            {"id": str(uuid.uuid4()), "name": name, "visible": True}
            for name in DEFAULT_COLUMNS
        ],
        "activeDataset": DEFAULT_DATASETS[0],
        "datasets": {name: [] for name in DEFAULT_DATASETS},
    }


def normalize_state(state):
    fallback = default_state()
    if not isinstance(state, dict):
        return fallback

    if not isinstance(state.get("columns"), list):
        state["columns"] = fallback["columns"]

    active_dataset = state.get("activeDataset")
    if active_dataset not in DEFAULT_DATASETS:
        active_dataset = DEFAULT_DATASETS[0]

    datasets = {name: [] for name in DEFAULT_DATASETS}
    saved_datasets = state.get("datasets")
    if isinstance(saved_datasets, dict):
        for name in DEFAULT_DATASETS:
            if isinstance(saved_datasets.get(name), list):
                datasets[name] = saved_datasets[name]
    elif isinstance(state.get("rows"), list):
        datasets[DEFAULT_DATASETS[0]] = state["rows"]

    return {
        "columns": state["columns"],
        "activeDataset": active_dataset,
        "datasets": datasets,
    }


def read_state():
    if not DATA_FILE.exists():
        state = default_state()
        write_state(state)
        return state

    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            state = json.load(file)
    except (json.JSONDecodeError, OSError):
        state = default_state()

    state = normalize_state(state)
    write_state(state)
    return state


def write_state(state):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)


class ScannerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/state":
            self.send_json(read_state())
            return
        if self.path.startswith("/api/products/"):
            code = unquote(self.path.removeprefix("/api/products/"))
            self.send_json(find_product_by_code(code))
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/state":
            self.send_error(404, "Not found")
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)

        try:
            state = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return

        if not isinstance(state, dict):
            self.send_error(400, "State must be an object")
            return
        if not isinstance(state.get("columns"), list):
            self.send_error(400, "State must include columns")
            return

        write_state(normalize_state(state))
        self.send_json({"ok": True})

    def send_json(self, data):
        content = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def find_product_by_code(code):
    state = read_state()
    code_column = next(
        (
            column
            for column in state["columns"]
            if column.get("name", "").strip().lower() == "code"
        ),
        None,
    )

    if not code_column:
        return {"exists": False}

    code_id = code_column["id"]
    for dataset_name, rows in state["datasets"].items():
        for index, row in enumerate(rows):
            if str(row.get(code_id, "")).strip() == code:
                return {
                    "exists": True,
                    "product": {
                        "dataset": dataset_name,
                        "rowIndex": index,
                        "row": row,
                    },
                }

    return {"exists": False}


def main():
    server = ThreadingHTTPServer(("localhost", PORT), ScannerHandler)
    print(f"Product Scanner running at http://localhost:{PORT}")
    print(f"Saving data to {DATA_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
