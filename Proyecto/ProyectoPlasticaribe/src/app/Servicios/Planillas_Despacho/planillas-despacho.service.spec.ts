import { TestBed } from '@angular/core/testing';

import { PlanillasDespachoService } from './planillas-despacho.service';

describe('PlanillasDespachoService', () => {
  let service: PlanillasDespachoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanillasDespachoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
