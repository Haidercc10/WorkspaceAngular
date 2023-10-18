import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Devoluciones_Productos_RollosComponent } from 'src/app/Vistas/Devoluciones_Productos_Rollos/Devoluciones_Productos_Rollos.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Devolución de Rollos'}, 
    component : Devoluciones_Productos_RollosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevolucionRollosRoutingModule { }
