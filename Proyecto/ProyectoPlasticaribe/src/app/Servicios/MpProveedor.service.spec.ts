/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MpProveedorService } from './MpProveedor.service';

describe('Service: MpProveedor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MpProveedorService]
    });
  });

  it('should ...', inject([MpProveedorService], (service: MpProveedorService) => {
    expect(service).toBeTruthy();
  }));
});
