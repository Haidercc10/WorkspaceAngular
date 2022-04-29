import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app.opedido.component',
  templateUrl: './opedido.component.html',
  styleUrls: ['./opedido.component.css']
})
export class OpedidoComponent implements OnInit {

  public formularioOpedido !: FormGroup;
  constructor( private frmBuilderOpedido : FormBuilder) { }


  ngOnInit(): void {

  }
}
