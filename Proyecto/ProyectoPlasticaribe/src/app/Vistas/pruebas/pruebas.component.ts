import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { EntradaBOPPService } from 'src/app/Servicios/entrada-BOPP.service';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit{

  public FormPrueba !: FormGroup;
  ArrayBOPP = []; //Varibale que almacenará los BOPP existentes

  constructor(private boppService : EntradaBOPPService,
                private formBuilder : FormBuilder,){
    this.FormPrueba = this.formBuilder.group({
      AsgBopp_OT : ['', Validators.required],
      AsgBopp : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerBOPP();
  }

  //Funcion que buscará y mostrará los BOPP existentes
  obtenerBOPP(){
    this.ArrayBOPP = [];
    this.boppService.srvObtenerLista().subscribe(datos_BOPP => {
      for (let i = 0; i < datos_BOPP.length; i++) {
        if (datos_BOPP[i].bopP_Stock != 0) {
          const bopp : any = {
            id : datos_BOPP[i].bopP_Serial,
            name : datos_BOPP[i].bopP_Nombre,
          }
          this.ArrayBOPP.push(bopp);
        }
      }
    });
  }

  keyword = 'name';
  data = [
    {
      id: 1,
      name: 'Georgia'
    },
     {
       id: 2,
       name: 'Usa'
     },
     {
       id: 3,
       name: 'England'
     }
  ];


  selectEvent(item) {
    this.FormPrueba.value.AsgBopp = item;
    // do something with selected item
  }

  // onChangeSearch(val: string) {
  //   // fetch remote data from here
  //   // And reassign the 'data' which is binded to 'data' property.
  // }

  // onFocused(e){
  //   // do something when input is focused
  // }

}
