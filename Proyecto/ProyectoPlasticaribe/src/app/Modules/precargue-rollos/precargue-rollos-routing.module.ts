import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Precargue_RollosDespachoComponent } from 'src/app/Vistas/Precargue_RollosDespacho/Precargue_RollosDespacho.component';

const routes: Routes = [{
  path: '',
  canActivate: [VistasPermisosGuard], 
  data: {nombre: 'Precargue Rollos'}, 
  component : Precargue_RollosDespachoComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrecargueRollosRoutingModule { }
