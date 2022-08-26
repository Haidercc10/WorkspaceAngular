/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TratadoService } from './Tratado.service';

describe('Service: Tratado', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TratadoService]
    });
  });

  it('should ...', inject([TratadoService], (service: TratadoService) => {
    expect(service).toBeTruthy();
  }));
});
