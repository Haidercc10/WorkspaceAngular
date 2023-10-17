import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { ReporteMateriaPrimaComponent } from 'src/app/Vistas/reporteMateriaPrima/reporteMateriaPrima.component';

const routes: Routes = [
  {
    path: '', 
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Inventario Mat. Prima'}, 
    component: ReporteMateriaPrimaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioMateriasPrimasRoutingModule { }
