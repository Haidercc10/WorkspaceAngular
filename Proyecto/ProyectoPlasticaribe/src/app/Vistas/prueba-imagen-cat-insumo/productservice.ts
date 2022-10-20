import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

@Injectable()
export class ProductService {

    constructor(private http: HttpClient) { }

    getProductsSmall() {
        return this.http.get<any>('assets/products-small.json')
        .toPromise()
        .then(res => res.data)
        .then(data => { return data; });
    }
}
