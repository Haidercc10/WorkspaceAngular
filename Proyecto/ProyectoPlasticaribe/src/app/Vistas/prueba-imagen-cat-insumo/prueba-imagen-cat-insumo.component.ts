import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { ClientesService } from 'src/app/Servicios/clientes.service';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})
export class PruebaImagenCatInsumoComponent implements OnInit {

  keywordClientes = 'cli_Nombre'; /** Variable de palabra clave para Input Producto. */
  validarInputClientes : any = true; /** Variable para validar input producto */
  arrayClientes=[]; /** Array que guardará los clientes en el select input */
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;


  constructor(private servicioClientes: ClientesService,){

  }

  ngOnInit(): void {
    this.llenadoClientes()
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.arrayClientes.filter(option => option.toLowerCase().includes(filterValue));
  }

  //Funcion que llanará el array de clientes
  llenadoClientes(){
    this.servicioClientes.srvObtenerLista().subscribe(registrosClientes => {
      for (let index = 0; index < registrosClientes.length; index++) {
        let Clientes : any = registrosClientes[index];
          this.arrayClientes.push(Clientes);
      }
    });
  }



}
