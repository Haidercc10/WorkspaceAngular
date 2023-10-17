import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ReportePedidos_ZeusComponent } from 'src/app/Vistas/ReportePedidos_Zeus/ReportePedidos_Zeus.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ver Pedidos'}, 
    component: ReportePedidos_ZeusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosZeusRoutingModule { }
