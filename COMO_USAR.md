# Eletricista Pro - NBR 5410

## Como usar no celular

1. **O servidor inicia automaticamente** quando você liga o computador
2. **No celular**, abra o navegador e acesse: `http://192.168.1.2:8765`
3. **Importante**: Celular e computador devem estar na mesma rede Wi-Fi

## Arquivos importantes

- **Iniciar servidor manualmente**: Clique duas vezes em `iniciar_silencioso.vbs` ou use o atalho na Área de Trabalho
- **Parar servidor**: Execute `parar_servidor.bat`
- **Verificar se está rodando**: Abra o terminal e digite `netstat -ano | findstr :8765`

## Se o IP mudar

Se o IP do computador mudar (192.168.1.2), descubra o novo IP:
1. Abra o terminal (cmd)
2. Digite: `ipconfig`
3. Procure por "Endereço IPv4" na sua conexão Wi-Fi
4. Use o novo IP no celular: `http://NOVO_IP:8765`

## Dica

Para acessar mais facilmente no celular, salve o endereço como favorito no navegador.
