import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioVsTomaFisicaComponent } from './inventario-vs-toma-fisica.component';

describe('InventarioVsTomaFisicaComponent', () => {
  let component: InventarioVsTomaFisicaComponent;
  let fixture: ComponentFixture<InventarioVsTomaFisicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventarioVsTomaFisicaComponent]
    });
    fixture = TestBed.createComponent(InventarioVsTomaFisicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
