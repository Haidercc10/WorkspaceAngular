import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_FacturacionZeusComponent } from 'src/app/Vistas/Reporte_FacturacionZeus/Reporte_FacturacionZeus.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Consolidado de Facturación'}, 
    component: Reporte_FacturacionZeusComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsolidadFacturacionRoutingModule { }
