/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes recent versions of Safari, Chrome (including
 * Opera), Edge on the desktop, and iOS and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support


/***************************************************************************************************
 * BROWSER POLYFILLS



 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *


/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.

/* RUTA PRINCIPAL DE API */
export let rutaPlasticaribeAPI = "http://192.168.0.85:9086/api"; //Ruta al servidor de la base de datos nuevas
//export let rutaPlasticaribeAPI = "https://localhost:7032/api"; //Ruta local del api de prueba.
// export let rutaPlasticaribeAPI = "http://192.168.0.153:9085/api"; //Ruta local del api de prueba.
// export let rutaPlasticaribeAPI = "http://192.168.0.153:9080/api"; //Ruta local a la BASE DE DATOS DE PRUEBA del api de prueba.
// export let rutaPlasticaribeAPI = "http://192.168.0.189:9060/api"; //Ruta al servidor de la base de datos nuevas
//export let rutaPlasticaribeAPI = "https://localhost:7137/api"; //Ruta local del api de prueba.
//  export let rutaPlasticaribeAPI = "http://192.168.0.189:9093/api"; //Ruta al servidor de la base de datos nuevas
//  export let rutaPlasticaribeAPI = "https://localhost:7137/api"; //Ruta local del api de prueba.
  // export let rutaPlasticaribeAPI = "http://192.168.0.140:9090/api"; //Ruta al servidor de la base de datos nuevas



/* RUTA PRINCIPAL DE API BAGPRO */
//  export let rutaBagPro = "http://192.168.0.85:9095/api"; //Ruta al servidor de la base de datos de BagPro --- SERVIDOR
//export let rutaBagPro = "https://localhost:7160/api";
 export let rutaBagPro = "http://192.168.0.140:9056/api"; //Ruta al servidor de la base de datos de BagPro --- LOCAL
//export let rutaBagPro = "http://192.168.0.153:9095/api"; //Ruta al servidor de la base de datos de BagPro --- PRUEBA LOCAL


/* RUTA PRINCIPAL DE API ZEUS */
export let rutaZeus = "http://192.168.0.85:9055/api"; //Ruta al servidor de la base de datos de Zeus --- SERVIDOR
//export let rutaZeus = "https://localhost:7283/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL
//  export let rutaZeus = "http://192.168.0.187:9055/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL
// export let rutaZeus = "http://192.168.0.153:9075/api" //Ruta al servidor de la base de datos de Zeus --- LOCAL

/* RUTA PRINCIPAL API ZEUS CONSTABILIDAD */
export let rutaZeusContabilidad = "http://192.168.0.85:9065/api"; //Ruta de prueba del API
// export let rutaZeusContabilidad = "http://192.168.0.153:9055/api"; //Ruta de prueba del API
// export let rutaZeusContabilidad = "http://192.168.0.195:9059/api"; //Ruta de prueba del API
/***************************************************************************************************
 * APPLICATION IMPORTS
 */
