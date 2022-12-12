import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrearProveedorService {

  constructor() { }

  $modal = new EventEmitter<any>();
}
