import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ReporteFacturacionClientesComponent } from 'src/app/Vistas/ReporteFacturacionClientes/ReporteFacturacionClientes.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Facturación de Clientes'}, 
    component: ReporteFacturacionClientesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReporteFacturacionClientesRoutingModule { }
