import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { OcompraComponent } from 'src/app/Vistas/ocompra/ocompra.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard],
    data: {nombre: 'Orden de Compra'}, 
    component: OcompraComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenCompraRoutingModule { }
