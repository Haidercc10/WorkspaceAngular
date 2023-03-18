/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TercerosService } from './Terceros.service';

describe('Service: Terceros', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TercerosService]
    });
  });

  it('should ...', inject([TercerosService], (service: TercerosService) => {
    expect(service).toBeTruthy();
  }));
});
