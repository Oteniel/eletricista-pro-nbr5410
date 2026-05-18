import http.server
import socketserver
import sys
import os
import socket

# Configuracoes do servidor
PORT = 8765
DIRECTORY = "."

# Detectar IP local automaticamente
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

LOCAL_IP = get_local_ip()

# Definir titulo da janela
if sys.platform == "win32":
    os.system(f"title Servidor Eletricista Pro - Porta {PORT}")

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

print("=" * 50)
print("  Eletricista Pro - NBR 5410")
print("  Servidor Local")
print("=" * 50)
print()
print(f"  Servidor iniciado na porta {PORT}")
print()
print(f"  Acesse no celular:")
print(f"  http://{LOCAL_IP}:{PORT}")
print()
print("  Celular e computador devem estar na")
print("  mesma rede Wi-Fi.")
print()
print("  Pressione Ctrl+C para parar.")
print("=" * 50)
print()

try:
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServidor parado.")
    sys.exit(0)
