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

  control = new FormControl('');
  streets: string[] = ['Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue'];
  filteredStreets: Observable<string[]>;
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

  ngOnInit() {
    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.streets.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

}
