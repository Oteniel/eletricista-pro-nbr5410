import http.server
import socketserver
import sys
import os

# Configurações do servidor
PORT = 8765
DIRECTORY = "."

# Definir título da janela
if sys.platform == "win32":
    os.system(f"title Servidor Eletricista Pro - Porta {PORT}")

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"Servidor Eletricista Pro iniciado!")
print(f"Acesse no celular: http://192.168.1.2:{PORT}")
print("Servidor rodando em segundo plano. Pressione Ctrl+C para parar.")

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    httpd.serve_forever()
