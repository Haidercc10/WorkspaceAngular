import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Reporte_RecuperadoMPComponent } from 'src/app/Vistas/Reporte_RecuperadoMP/Reporte_RecuperadoMP.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Movimientos Recuperado'}, 
    component : Reporte_RecuperadoMPComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosRecuperadoRoutingModule { }
