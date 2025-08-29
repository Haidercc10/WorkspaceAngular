import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovDevolucionesCalidadComponent } from './mov-devoluciones-calidad.component';

describe('MovDevolucionesCalidadComponent', () => {
  let component: MovDevolucionesCalidadComponent;
  let fixture: ComponentFixture<MovDevolucionesCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovDevolucionesCalidadComponent]
    });
    fixture = TestBed.createComponent(MovDevolucionesCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
