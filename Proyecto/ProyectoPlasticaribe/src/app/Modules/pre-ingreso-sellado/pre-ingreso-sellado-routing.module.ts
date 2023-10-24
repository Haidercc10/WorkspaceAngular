import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PreIngresoRolloSelladoComponent } from 'src/app/Vistas/PreIngresoRolloSellado/PreIngresoRolloSellado.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Pre Ingreso Empaque Sellado'}, 
    component : PreIngresoRolloSelladoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreIngresoSelladoRoutingModule { }
