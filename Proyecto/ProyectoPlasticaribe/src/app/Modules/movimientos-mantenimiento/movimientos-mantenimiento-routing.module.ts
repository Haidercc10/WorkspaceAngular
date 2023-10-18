import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Movimientos_MantenimientoComponent } from 'src/app/Vistas/Movimientos_Mantenimiento/Movimientos_Mantenimiento.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimiento de Mantenimientos de Activos'}, 
    component: Movimientos_MantenimientoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosMantenimientoRoutingModule { }
