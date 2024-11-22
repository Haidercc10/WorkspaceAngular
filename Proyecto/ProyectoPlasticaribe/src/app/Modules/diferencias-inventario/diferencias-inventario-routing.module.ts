import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Diferencias_InventarioComponent } from 'src/app/Vistas/Diferencias_Inventario/Diferencias_Inventario.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Diferencias de Inventario'}, 
    component : Diferencias_InventarioComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiferenciasInventarioRoutingModule { }
