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
  validarInput : any;
  keyword = 'name';
  public historyHeading: string = 'Seleccionado Recientemente';

  constructor(private boppService : EntradaBOPPService,
                private formBuilder : FormBuilder,){
    this.FormPrueba = this.formBuilder.group({
      AsgBopp_OT : ['', Validators.required],
      AsgBopp : ['', Validators.required],
    });
    this.validarInput = true;
  }

  ngOnInit(): void {

  }

}
