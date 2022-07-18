/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TintasMPService } from './tintasMP.service';

describe('Service: TintasMP', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TintasMPService]
    });
  });

  it('should ...', inject([TintasMPService], (service: TintasMPService) => {
    expect(service).toBeTruthy();
  }));
});
