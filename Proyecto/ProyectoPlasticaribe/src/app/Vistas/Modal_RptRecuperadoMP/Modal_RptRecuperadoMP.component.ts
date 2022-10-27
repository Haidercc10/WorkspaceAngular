import { Component, Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-Modal_RptRecuperadoMP',
  templateUrl: './Modal_RptRecuperadoMP.component.html',
  styleUrls: ['./Modal_RptRecuperadoMP.component.css']
})
export class Modal_RptRecuperadoMPComponent implements OnInit {

  arrayRegistros : any = []; //Variable que va a contener la infomacion de los registrada
  constructor() { }

  ngOnInit() {
  }

}
