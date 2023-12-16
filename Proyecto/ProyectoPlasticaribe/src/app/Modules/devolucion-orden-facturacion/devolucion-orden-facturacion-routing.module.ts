import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Devolucion_OrdenFacturacionComponent } from 'src/app/Vistas/Devolucion_OrdenFacturacion/Devolucion_OrdenFacturacion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard],
    data: {nombre: 'Devolución Orden de Facturación'},
    component : Devolucion_OrdenFacturacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DevolucionOrdenFacturacionRoutingModule { }
