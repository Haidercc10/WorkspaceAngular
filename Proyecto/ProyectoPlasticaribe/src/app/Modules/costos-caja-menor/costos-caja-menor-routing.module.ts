import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Costos_CajaMenorComponent } from 'src/app/Vistas/Costos_CajaMenor/Costos_CajaMenor.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Costos Caja Menor'}, 
    component: Costos_CajaMenorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostosCajaMenorRoutingModule { }
