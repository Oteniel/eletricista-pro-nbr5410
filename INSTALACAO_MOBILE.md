# INSTALACAO NO CELULAR - Eletricista Pro v7.0

## Opcao 1: APK Android (RECOMENDADO - 100% Offline)

Esta opcao cria um app instalavel que funciona SEM internet.

### Requisitos:
- Windows com Node.js instalado (baixe em https://nodejs.org/)
- Android Studio instalado (para gerar o APK)

### Passos:
1. Abra o terminal na pasta do projeto
2. Execute: `gerar_apk.bat`
3. O Android Studio vai abrir automaticamente
4. No Android Studio:
   - Aguarde o Gradle sincronizar (pode demorar na primeira vez)
   - Menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
5. O APK sera gerado em: `android\app\build\outputs\apk\debug\app-debug.apk`
6. Transfira o APK para o celular (USB, Bluetooth, etc.)
7. No celular, toque no APK para instalar
8. Pronto! O app funciona sem internet.

### Gerar APK pelo terminal (se tiver Android SDK):
```
cd android
gradlew assembleDebug
```
O APK sera gerado em: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Opcao 2: Copiar arquivos para o celular (Simples)

1. Conecte o celular ao computador por USB
2. Copie TODA a pasta `eletricista-pro-nbr5410` para o celular
3. No celular, use um gerenciador de arquivos
4. Navegue ate a pasta e toque em `index.html`
5. Escolha abrir com o Chrome
6. O app funciona offline!

---

## Opcao 3: Via Wi-Fi Local (Precisa da mesma rede)

1. Execute `iniciar.bat` no computador
2. Anote o IP mostrado na tela (ex: 192.168.1.100)
3. No celular, abra o Chrome
4. Acesse: `http://IP_DO_COMPUTADOR:8765`
5. Toque no menu (3 pontinhos) > "Adicionar a tela inicial"
6. O app funciona offline apos o primeiro acesso

---

## Opcao 4: PWA (Progressive Web App)

Se o app estiver hospedado em um servidor com HTTPS:

1. Abra o app no Chrome
2. Toque no menu (3 pontinhos)
3. Toque em "Adicionar a tela inicial" ou "Instalar app"
4. Confirme a instalacao
5. O app aparece na tela inicial e funciona offline

---

## Solucao de Problemas

### "App nao abre no celular"
- Use o Chrome para abrir o arquivo index.html
- Certifique-se de copiar TODOS os arquivos da pasta

### "APK nao instala"
- Vá em Configurações > Segurança > "Fontes desconhecidas"
- Permita a instalacao de apps de fontes desconhecidas

### "APK nao gera"
- Verifique se o Node.js esta instalado: `node --version`
- Verifique se o Android Studio esta instalado
- Execute: `npm install` manualmente primeiro

### "Nao consigo acessar via Wi-Fi"
- Celular e computador devem estar na MESMA rede Wi-Fi
- Verifique o firewall do Windows (libere a porta 8765)
- Descubra o IP correto com o comando: `ipconfig`
