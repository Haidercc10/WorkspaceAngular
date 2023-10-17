import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { MateriaPrimaRecuperadaComponent } from 'src/app/Vistas/MateriaPrimaRecuperada/MateriaPrimaRecuperada.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Mat. Prima Recuperada'}, 
    component: MateriaPrimaRecuperadaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MateriaPrimaRecuperadaRoutingModule { }
