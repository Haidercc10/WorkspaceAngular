import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PedidoMantenimientoComponent } from 'src/app/Vistas/Pedido-Mantenimiento/Pedido-Mantenimiento.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Pedido de Mantenimiento de Activos'}, 
    component: PedidoMantenimientoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidoMantenimientoRoutingModule { }
