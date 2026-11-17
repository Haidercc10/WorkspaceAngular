// Sube la versión de la aplicación usando la fecha de hoy (versionamiento por fecha).
//   Primera entrega del día:  2026.11.16
//   Siguientes del mismo día: 2026.11.16-2, 2026.11.16-3, ...
// En package.json se guarda sin ceros a la izquierda (semver no los admite: 2026.1.5);
// generar-version.js los agrega al mostrarla (2026.01.05).
// Usa npm version, que actualiza package.json y package-lock.json y ejecuta generar-version.js.
const { execSync } = require('child_process');
const path = require('path');

const { version: actual } = require('../package.json');
const hoy = new Date();
const base = `${hoy.getFullYear()}.${hoy.getMonth() + 1}.${hoy.getDate()}`;

let nueva = base;
if (actual === base) {
  nueva = `${base}-2`;
} else if (actual.startsWith(`${base}-`)) {
  const consecutivo = Number(actual.slice(base.length + 1));
  if (Number.isInteger(consecutivo)) nueva = `${base}-${consecutivo + 1}`;
}

console.log(`Versión: ${actual} → ${nueva}`);
execSync(`npm version ${nueva} --no-git-tag-version`, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
});
