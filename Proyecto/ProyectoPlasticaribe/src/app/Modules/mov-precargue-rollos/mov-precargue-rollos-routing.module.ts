import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Mov_PrecargueDespachoComponent } from 'src/app/Vistas/Mov_PrecargueDespacho/Mov_PrecargueDespacho.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Mov. Precargue Rollos'}, 
    component : Mov_PrecargueDespachoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovPrecargueRollosRoutingModule { }
