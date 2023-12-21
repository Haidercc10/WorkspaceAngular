import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Movimientos_PreIngresoProduccionComponent } from 'src/app/Vistas/Movimientos_PreIngresoProduccion/Movimientos_PreIngresoProduccion.component';

const routes: Routes = [
  {
    path: '',
    canActivate : [VistasPermisosGuard],
    data : { nombre : 'Movimientos Preingreso Produccion'}, 
    component : Movimientos_PreIngresoProduccionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MovimientosPreingresoProduccionRoutingModule {}
