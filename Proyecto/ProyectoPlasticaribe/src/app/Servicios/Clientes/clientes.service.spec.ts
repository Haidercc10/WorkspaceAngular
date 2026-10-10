import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ClientesService } from './clientes.service';
import { environment } from 'src/environments/environment';
import { modelClienteReporteOT } from '../../Modelo/modelClienteReporteOT';

describe('ClientesService', () => {
  let service: ClientesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ClientesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('keeps the existing full-list endpoint unchanged', () => {
    service.srvObtenerLista().subscribe();

    const request = httpTestingController.expectOne(`${environment.rutaPlasticaribeAPI}/Clientes`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('requests the typed OT report customer summary', () => {
    const customers: modelClienteReporteOT[] = [
      { cli_Id: 15, cli_Nombre: 'Cliente de prueba', usua_Id: 8 }
    ];
    let response: modelClienteReporteOT[] | undefined;

    service.srvObtenerResumenReporteOT().subscribe(data => response = data);

    const request = httpTestingController.expectOne(`${environment.rutaPlasticaribeAPI}/Clientes/resumenReporteOT`);
    expect(request.request.method).toBe('GET');
    request.flush(customers);

    expect(response).toEqual(customers);
  });
});
