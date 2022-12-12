/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BoppGenericoService } from './BoppGenerico.service';

describe('Service: BoppGenerico', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoppGenericoService]
    });
  });

  it('should ...', inject([BoppGenericoService], (service: BoppGenericoService) => {
    expect(service).toBeTruthy();
  }));
});
