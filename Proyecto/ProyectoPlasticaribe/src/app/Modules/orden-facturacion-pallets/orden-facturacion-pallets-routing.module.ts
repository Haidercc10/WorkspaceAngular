import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { OrdenFacturacion_PalletsComponent } from 'src/app/Vistas/OrdenFacturacion_Pallets/OrdenFacturacion_Pallets.component';

const routes: Routes = [{
    path: '',
    canActivate: [VistasPermisosGuard],
    data: {nombre: 'Facturación Pallets'}, 
    component: OrdenFacturacion_PalletsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenFacturacionPalletsRoutingModule { }
