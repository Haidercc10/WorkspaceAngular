import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Facturacion_OrdenMaquilaComponent } from 'src/app/Vistas/Facturacion_OrdenMaquila/Facturacion_OrdenMaquila.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Facturar Orden de Maquila'}, 
    component: Facturacion_OrdenMaquilaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionOrdenMaquilaRoutingModule { }
