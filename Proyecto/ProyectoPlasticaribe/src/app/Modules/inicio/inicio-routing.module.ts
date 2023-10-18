import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PaginaPrincipalComponent } from 'src/app/Vistas/PaginaPrincipal/PaginaPrincipal.component';

const routes: Routes = [
  {
    path: '', 
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Inicio'}, 
    component: PaginaPrincipalComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
