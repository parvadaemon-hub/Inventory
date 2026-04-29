from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
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


def default_state():
    return {
        "columns": [
            {"id": str(uuid.uuid4()), "name": name, "visible": True}
            for name in DEFAULT_COLUMNS
        ],
        "rows": [],
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

    if not isinstance(state, dict):
        return default_state()
    if not isinstance(state.get("columns"), list):
        state["columns"] = default_state()["columns"]
    if not isinstance(state.get("rows"), list):
        state["rows"] = []
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
        if not isinstance(state.get("columns"), list) or not isinstance(state.get("rows"), list):
            self.send_error(400, "State must include columns and rows")
            return

        write_state(state)
        self.send_json({"ok": True})

    def send_json(self, data):
        content = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main():
    server = ThreadingHTTPServer(("localhost", PORT), ScannerHandler)
    print(f"Product Scanner running at http://localhost:{PORT}")
    print(f"Saving data to {DATA_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
