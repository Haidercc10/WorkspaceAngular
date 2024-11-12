import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Ingreso_PeletizadoComponent } from 'src/app/Vistas/Ingreso_Peletizado/Ingreso_Peletizado.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Ingreso Peletizado'}, 
    component: Ingreso_PeletizadoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngresoPeletizadoRoutingModule { }
