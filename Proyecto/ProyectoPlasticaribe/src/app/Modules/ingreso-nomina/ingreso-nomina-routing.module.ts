import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Ingreso_NominaComponent } from 'src/app/Vistas/Ingreso_Nomina/Ingreso_Nomina.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ingreso de Nómina'}, 
    component: Ingreso_NominaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngresoNominaRoutingModule { }
