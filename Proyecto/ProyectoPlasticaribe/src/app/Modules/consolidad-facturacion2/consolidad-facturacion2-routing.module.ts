import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_Consolidado_FacturacionComponent } from 'src/app/Vistas/Reporte_Consolidado_Facturacion/Reporte_Consolidado_Facturacion.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Consolidado Facturación 2'}, 
    component: Reporte_Consolidado_FacturacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsolidadFacturacion2RoutingModule { }
