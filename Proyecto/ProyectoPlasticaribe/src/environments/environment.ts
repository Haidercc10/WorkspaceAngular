// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  /* RUTA PRINCIPAL DE API */
  rutaPlasticaribeAPI : "http://192.168.0.85:9086/api", //Ruta al servidor de la base de datos nuevas
  // export let this.rutaPlasticaribeAPI : "http://192.168.0.193:9085/api"; //Ruta local del api de prueba.
  //export let this.rutaPlasticaribeAPI : "https://localhost:7137/api"; //Ruta local del api de prueba.
    //  export let this.rutaPlasticaribeAPI : "http://192.168.0.190:9086/api"; //Ruta al servidor de la base de datos nuevas

  /* RUTA PRINCIPAL DE API BAGPRO */
  rutaBagPro : "http://192.168.0.85:9095/api", //Ruta al servidor de la base de datos de BagPro --- SERVIDOR
  //export let rutaBagPro : "https://localhost:7160/api";
  // export let rutaBagPro : "http://192.168.0.193:9095/api"; //Ruta al servidor de la base de datos de BagPro --- PRUEBA LOCAL
      // export let rutaBagPro : "http://192.168.0.190:9095/api"; //Ruta al servidor de la base de datos nuevas


  /* RUTA PRINCIPAL DE API ZEUS */
  rutaZeus : "http://192.168.0.85:9055/api", //Ruta al servidor de la base de datos de Zeus --- SERVIDOR
  //export let rutaZeus : "https://localhost:7283/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL
  //export let rutaZeus : "http://192.168.0.193:9075/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL
    // export let rutaZeus : "http://192.168.0.190:9055/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL

  /* RUTA PRINCIPAL API ZEUS CONSTABILIDAD */
  rutaZeusContabilidad : "http://192.168.0.85:9065/api", //Ruta de prueba del API
  //rutaZeusContabilidad : "http://192.168.0.190:9065/api", //Ruta de prueba del API
  //export let rutaZeusContabilidad : "http://localhost:7067/api"; //Ruta de prueba del API
  //export let rutaZeusContabilidad : "http://192.168.0.193:9055/api"; //Ruta de prueba del API
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
