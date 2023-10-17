import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_CertificadosCalidadComponent } from 'src/app/Vistas/Reporte_CertificadosCalidad/Reporte_CertificadosCalidad.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Certificados Calidad'}, 
    component: Reporte_CertificadosCalidadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovCertificadosCalidadRoutingModule { }
