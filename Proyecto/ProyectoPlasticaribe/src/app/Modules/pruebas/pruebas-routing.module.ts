import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistasPermisosGuard } from 'src/app/Guards/vistas-permisos.guard';
import { Formato_Facturas_VentasComponent } from 'src/app/Vistas/Formato_Facturas_Ventas/Formato_Facturas_Ventas.component';
import { PruebaImagenCatInsumoComponent } from 'src/app/Vistas/prueba-imagen-cat-insumo/prueba-imagen-cat-insumo.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [VistasPermisosGuard], 
    data: {nombre: 'Pruebas'}, 
    // component: Formato_Facturas_VentasComponent
    component: PruebaImagenCatInsumoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PruebasRoutingModule { }
