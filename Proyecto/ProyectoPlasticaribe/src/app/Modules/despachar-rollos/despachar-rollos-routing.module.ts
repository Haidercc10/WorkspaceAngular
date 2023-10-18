import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { RollosAsignadasFacturaComponent } from 'src/app/Vistas/RollosAsignadasFactura/RollosAsignadasFactura.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Despachar Mercancia'}, 
    component : RollosAsignadasFacturaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DespacharRollosRoutingModule { }
