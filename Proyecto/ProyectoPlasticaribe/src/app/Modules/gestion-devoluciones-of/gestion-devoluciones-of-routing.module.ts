import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Gestion_DevolucionesOFComponent } from 'src/app/Vistas/Gestion_DevolucionesOF/Gestion_DevolucionesOF.component';

const routes: Routes = [
  {
    path: '',
    canActivate : [VistasPermisosGuard],
    data : { nombre : ['Gestión de Devoluciones'] },
    component: Gestion_DevolucionesOFComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionDevolucionesOfRoutingModule { }
