import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SrvModalCrearProductosService {

  constructor() { }

  $modal = new EventEmitter<any>();

}
