import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientosTomaFisicaComponent } from './movimientos-toma-fisica.component';

describe('MovimientosTomaFisicaComponent', () => {
  let component: MovimientosTomaFisicaComponent;
  let fixture: ComponentFixture<MovimientosTomaFisicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovimientosTomaFisicaComponent]
    });
    fixture = TestBed.createComponent(MovimientosTomaFisicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
