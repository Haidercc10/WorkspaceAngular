// Genera src/environments/version.ts a partir del campo "version" de package.json.
// Se ejecuta solo antes de compilar/servir y al subir la versión con npm run version:*.
const fs = require('fs');
const path = require('path');

const { version } = require('../package.json');
const destino = path.join(__dirname, '..', 'src', 'environments', 'version.ts');
const contenido =
`// ARCHIVO GENERADO por scripts/generar-version.js. No editar a mano:
// la versión se cambia con npm run version:parche | version:menor | version:mayor
export const VERSION_APP = '${version}';
`;

if (!fs.existsSync(destino) || fs.readFileSync(destino, 'utf8') !== contenido) {
  fs.writeFileSync(destino, contenido);
}
console.log(`Versión de la aplicación: ${version}`);
