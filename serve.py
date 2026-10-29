"""Static local preview, with read-only access to this project's three MPQs."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
MPQ_ROOT = ROOT.parent / 'assets' / 'mpq'
MPQ_NAMES = {'StarDat.mpq', 'BrooDat.mpq', 'Patch_rt.mpq'}


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm': 'application/wasm'}

    def translate_path(self, path):
        parsed = urlsplit(path).path
        if parsed.startswith('/__local-mpq__/'):
            name = parsed[len('/__local-mpq__/'):]
            if name in MPQ_NAMES:
                return str(MPQ_ROOT / name)
            return str(ROOT / '__not_found__')
        return super().translate_path(path)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(ROOT)))
    print(f'Replay Lab: http://127.0.0.1:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
