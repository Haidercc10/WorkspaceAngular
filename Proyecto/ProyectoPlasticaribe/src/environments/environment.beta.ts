// Entorno de PRUEBAS (servidor 192.168.0.250).
// Se usa al compilar con: npm run build:beta
export const environment = {
  production: true,
  esBeta: true, // Muestra el distintivo BETA y el título "PLASTICARIBE (BETA)"
  rutaPlasticaribeAPI : "http://192.168.0.250:9085/api",
  rutaBagPro : "http://192.168.0.250:9095/api",
  rutaZeus : "http://192.168.0.250:9055/api",
  rutaZeusContabilidad : "http://192.168.0.250:9065/api",
};
