import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { PedidomateriaprimaComponent } from 'src/app/Vistas/pedidomateriaprima/pedidomateriaprima.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Entrada Materia Prima'}, 
    component: PedidomateriaprimaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntradaMateriaPrimaRoutingModule { }
