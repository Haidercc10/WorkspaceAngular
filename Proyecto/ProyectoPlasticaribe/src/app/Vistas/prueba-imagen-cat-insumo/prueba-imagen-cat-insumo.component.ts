import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  files: TreeNode[];

  cols: any[];

  numbers = [45, 4, 9, 16, 25];

  constructor() { }

  ngOnInit() {
      // this.nodeService.getFilesystem().then(files => this.files = files);
      this.files = [
        {
          "data":{
              "name":"Applications",
              "size":"200mb",
              "type":"Folder"
          },
          "children":[
              {
                  "data":{
                      "name":"editor.app",
                      "size":"25mb",
                      "type":"Application"
                  }
              },
              {
                  "data":{
                      "name":"settings.app",
                      "size":"50mb",
                      "type":"Application"
                  }
              }
          ]
        },
      ]

      this.cols = [
          { field: 'name', header: 'Name' },
          { field: 'size', header: 'Size' },
          { field: 'type', header: 'Type' }
      ];

    console.log(this.numbers.find(this.myFunction))
  }

  myFunction(value, index, array) {
    return value > 18;
  }

}
