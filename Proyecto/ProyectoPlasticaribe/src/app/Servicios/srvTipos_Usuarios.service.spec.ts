/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SrvTipos_UsuariosService } from './srvTipos_Usuarios.service';

describe('Service: SrvTipos_Usuarios', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SrvTipos_UsuariosService]
    });
  });

  it('should ...', inject([SrvTipos_UsuariosService], (service: SrvTipos_UsuariosService) => {
    expect(service).toBeTruthy();
  }));
});
