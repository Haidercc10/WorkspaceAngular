/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReposicionesService } from './Reposiciones.service';

describe('Service: Reposiciones', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReposicionesService]
    });
  });

  it('should ...', inject([ReposicionesService], (service: ReposicionesService) => {
    expect(service).toBeTruthy();
  }));
});
