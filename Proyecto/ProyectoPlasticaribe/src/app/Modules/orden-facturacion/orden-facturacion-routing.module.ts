import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Orden_FacturacionComponent } from 'src/app/Vistas/Orden_Facturacion/Orden_Facturacion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard],
    data: {nombre: 'Orden de Facturación'}, 
    component: Orden_FacturacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenFacturacionRoutingModule { }
