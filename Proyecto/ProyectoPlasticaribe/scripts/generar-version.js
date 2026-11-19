// Genera src/environments/version.ts a partir del campo "version" de package.json.
// Se ejecuta solo antes de compilar/servir y al subir la versión con npm run version:subir.
// Las versiones por fecha se muestran con mes y día a dos dígitos: 2026.1.5-2 → 2026.01.05-2.
const fs = require('fs');
const path = require('path');

const { version } = require('../package.json');

const formatearVersion = (v) => {
  const partes = v.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})(-\d+)?$/);
  if (!partes) return v;
  const [, anio, mes, dia, consecutivo = ''] = partes;
  return `${anio}.${mes.padStart(2, '0')}.${dia.padStart(2, '0')}${consecutivo}`;
};

const versionVisible = formatearVersion(version);
const destino = path.join(__dirname, '..', 'src', 'environments', 'version.ts');
const contenido =
`// ARCHIVO GENERADO por scripts/generar-version.js. No editar a mano:
// la versión se cambia con npm run version:subir
export const VERSION_APP = '${versionVisible}';
`;

if (!fs.existsSync(destino) || fs.readFileSync(destino, 'utf8') !== contenido) {
  fs.writeFileSync(destino, contenido);
}
console.log(`Versión de la aplicación: ${versionVisible}`);
