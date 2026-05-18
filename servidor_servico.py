import http.server
import socketserver
import sys
import os
import time
import logging

# Configurações
PORT = 8765
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Configurar logging
logging.basicConfig(
    filename=os.path.join(DIRECTORY, 'servidor.log'),
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

class RobustHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        logging.info(format % args)

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), RobustHandler) as httpd:
        logging.info(f"Servidor iniciado na porta {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    try:
        run_server()
    except Exception as e:
        logging.error(f"Erro: {e}")
        sys.exit(1)
