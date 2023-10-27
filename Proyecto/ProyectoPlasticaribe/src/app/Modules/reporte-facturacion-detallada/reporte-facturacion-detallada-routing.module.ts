import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ReporteFacturacionDetalladaComponent } from 'src/app/Vistas/Reporte-Facturacion-Detallada/Reporte-Facturacion-Detallada.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Facturación Detallada'}, 
    component: ReporteFacturacionDetalladaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteFacturacionDetalladaRoutingModule { }
