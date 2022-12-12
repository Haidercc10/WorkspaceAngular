/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntradaRollosService } from './EntradaRollos.service';

describe('Service: EntradaRollos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntradaRollosService]
    });
  });

  it('should ...', inject([EntradaRollosService], (service: EntradaRollosService) => {
    expect(service).toBeTruthy();
  }));
});
