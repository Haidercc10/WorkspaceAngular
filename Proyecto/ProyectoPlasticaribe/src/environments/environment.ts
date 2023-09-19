// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  //SERVIDOR
  //rutaPlasticaribeAPI : "http://192.168.0.85:9086/api",
  rutaBagPro : "http://192.168.0.85:9095/api",
  rutaZeus : "http://192.168.0.85:9055/api",
  rutaZeusContabilidad : "http://192.168.0.85:9065/api",

  // LOCALES 1
   rutaPlasticaribeAPI : "http://192.168.0.190:9086/api",
  // rutaBagPro : "http://192.168.0.190:9095/api",
  // rutaZeus : "http://192.168.0.190:9055/api"
  // rutaZeusContabilidad : "http://192.168.0.190:9065/api"

  // LOCALES 2
  // rutaPlasticaribeAPI : "http://192.168.0.193:9085/api",
  // rutaBagPro : "http://192.168.0.193:9095/api",
  // rutaZeus : "http://192.168.0.193:9075/api",
  // rutaZeusContabilidad : "http://192.168.0.193:9055/api",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error',  // Included with Angular CLI.
