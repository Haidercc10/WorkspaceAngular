import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientosTintasComponent } from './movimientos-tintas.component';

describe('MovimientosTintasComponent', () => {
  let component: MovimientosTintasComponent;
  let fixture: ComponentFixture<MovimientosTintasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovimientosTintasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientosTintasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
