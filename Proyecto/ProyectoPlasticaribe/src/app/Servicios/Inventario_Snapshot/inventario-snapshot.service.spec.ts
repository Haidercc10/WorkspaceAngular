import { TestBed } from '@angular/core/testing';

import { InventarioSnapshotService } from './inventario-snapshot.service';

describe('InventarioSnapshotService', () => {
  let service: InventarioSnapshotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventarioSnapshotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
