// Script para preparar os arquivos do app mobile
// Copia os arquivos web para a pasta www (diretorio do Capacitor)

var fs = require('fs');
var path = require('path');

var sourceDir = __dirname;
var wwwDir = path.join(sourceDir, 'www');

// Arquivos que devem ir para a pasta www
var filesToCopy = [
  'index.html',
  'style.css',
  'app.js',
  'sw.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Criar pasta www se nao existir
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
  console.log('[BUILD] Pasta www criada.');
}

// Copiar cada arquivo
var copiedCount = 0;
filesToCopy.forEach(function(filename) {
  var src = path.join(sourceDir, filename);
  var dest = path.join(wwwDir, filename);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('[BUILD] Copiado: ' + filename);
    copiedCount++;
  } else {
    console.log('[AVISO] Arquivo nao encontrado: ' + filename);
  }
});

console.log('[BUILD] ' + copiedCount + ' arquivos copiados para www/');
console.log('[BUILD] Pronto para executar: npx cap sync android');
console.log('');
console.log('Proximos passos:');
console.log('1. npm install');
console.log('2. npx cap add android  (se ainda nao adicionou)');
console.log('3. npx cap sync android');
console.log('4. npx cap open android  (abre o Android Studio)');
console.log('');
console.log('Ou para gerar o APK direto (precisa do Android SDK):');
console.log('   cd android && gradlew assembleDebug');
