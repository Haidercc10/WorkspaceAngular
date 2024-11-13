import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';

export const routes: Routes = [

  /******************************************************************** Inicio y Login **********************************************************************/
  {path: '**', redirectTo: 'login'},
  {path: 'Login', loadChildren: () => import('./Modules/login/login.module').then(m => m.LoginModule)},
  {path: '', component: LoginComponentComponent},
  {path: 'home', loadChildren: () => import('./Modules/inicio/inicio.module').then(m => m.InicioModule) },
  {path: 'Archivos', loadChildren: () => import('./Modules/archivos/archivos.module').then(m => m.ArchivosModule) },
 
  /*************************************************************** DESPERDICIO *********************************************************************************/
  {path: 'desperdicio', loadChildren: () => import('./Modules/desperdicios/desperdicios.module').then(m => m.DesperdiciosModule)},
  {path: 'reporte-desperdicios', loadChildren: () => import('./Modules/movimientos-desperdicios/movimientos-desperdicios.module').then(m => m.MovimientosDesperdiciosModule)},

  {path: 'Tickets', loadChildren: () => import('./Modules/tickets/tickets.module').then(m => m.TicketsModule)},

  /*************************************************************** PRODUCCION *************************************************************************************************/
  {path: 'produccion-procesos', loadChildren: () => import('./Modules/produccion-extrusion/produccion-extrusion.module').then(m => m.ProduccionExtrusionModule)},
  {path: 'produccion-sellado', loadChildren: () => import('./Modules/produccion-sellado/produccion-sellado.module').then(m => m.ProduccionSelladoModule)},
  {path: 'reempaque-sellado', loadChildren: () => import('./Modules/reempaque-sellado/reempaque-sellado.module').then(m => m.ReempaqueSelladoModule)},
  //{path: 'rebobinado-corte', loadChildren: () => import('./Modules/rebobinados-corte/rebobinados-corte.module').then(m => m.RebobinadosCorteModule)}, 
  {path: 'maquilas-internas', loadChildren: () => import('./Modules/maquilas-internas/maquilas-internas.module').then(m => m.MaquilasInternasModule) },
  {path: 'mov-maquilas-internas', loadChildren: () => import('./Modules/mov-maquilas-internas/mov-maquilas-internas-routing.module').then(m => m.MovMaquilasInternasRoutingModule) },
  {path: 'reporte_produccion', loadChildren: () => import('./Modules/reporte-produccion/reporte-produccion.module').then(m => m.ReporteProduccionModule) },

  /*************************************************************** PELETIZADO *************************************************************************************************/
  { path: 'ingreso-peletizado', loadChildren: () => import('./Modules/ingreso-peletizado/ingreso-peletizado.module').then(m => m.IngresoPeletizadoModule) },
  { path: 'mov-ingreso-peletizado', loadChildren: () => import('./Modules/mov-ingreso-peletizado/mov-ingreso-peletizado.module').then(m => m.MovIngresoPeletizadoModule) },
  { path: 'inventario-peletizado', loadChildren: () => import('./Modules/inventario-peletizado/inventario-peletizado.module').then(m => m.InventarioPeletizadoModule) },
  { path: 'salidas-peletizado', loadChildren: () => import('./Modules/salidas-peletizado/salidas-peletizado.module').then(m => m.SalidasPeletizadoModule) },
  { path: 'mp-recuperada', loadChildren: () => import('./Modules/materia-prima-recuperada/materia-prima-recuperada.module').then(m => m.MateriaPrimaRecuperadaModule) },
  { path: 'reporte-recuperado-mp', loadChildren: () => import('./Modules/movimientos-recuperado/movimientos-recuperado.module').then(m => m.MovimientosRecuperadoModule) },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
