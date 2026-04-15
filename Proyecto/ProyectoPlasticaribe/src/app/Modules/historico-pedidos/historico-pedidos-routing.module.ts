import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { HistoricoPedidosComponent } from 'src/app/Vistas/historico-pedidos/historico-pedidos.component';

const routes: Routes = [
  {
      path: '',
      canActivate: [VistasPermisosGuard], 
      data: {nombre: 'Pedidos Historicos'}, 
      component : HistoricoPedidosComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoricoPedidosRoutingModule { }
