import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Kardex_MateriasPrimasComponent } from 'src/app/Vistas/Kardex_MateriasPrimas/Kardex_MateriasPrimas.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Kardex Materia Prima'}, 
    component: Kardex_MateriasPrimasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KardexMateriaPrimaRoutingModule { }
