import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Salidas_PeletizadoComponent } from 'src/app/Vistas/Salidas_Peletizado/Salidas_Peletizado.component';

const routes: Routes = [{
  path: '',
  canActivate: [VistasPermisosGuard], 
  data: {nombre: 'Salidas de Peletizado'}, 
  component : Salidas_PeletizadoComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalidasPeletizadoRoutingModule { }
