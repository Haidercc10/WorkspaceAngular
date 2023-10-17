import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Recibos_CajaComponent } from 'src/app/Vistas/Recibos_Caja/Recibos_Caja.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Reporte Recibos de Caja'}, 
    component: Recibos_CajaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecibosCajaZeusRoutingModule { }
