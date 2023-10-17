import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { AsignacionBOPP_TEMPORALComponent } from 'src/app/Vistas/asignacionBOPP_TEMPORAL/asignacionBOPP_TEMPORAL.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Asignación BOPP'}, 
    component: AsignacionBOPP_TEMPORALComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionBiorientadoRoutingModule { }
