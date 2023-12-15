import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { MovimientosOrdenFacturacionComponent } from 'src/app/Vistas/Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos de Orden Facturación'}, 
    component: MovimientosOrdenFacturacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosOrdenFacturacionRoutingModule { }
