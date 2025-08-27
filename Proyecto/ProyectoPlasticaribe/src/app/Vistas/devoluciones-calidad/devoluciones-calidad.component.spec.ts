import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesCalidadComponent } from './devoluciones-calidad.component';

describe('DevolucionesCalidadComponent', () => {
  let component: DevolucionesCalidadComponent;
  let fixture: ComponentFixture<DevolucionesCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevolucionesCalidadComponent]
    });
    fixture = TestBed.createComponent(DevolucionesCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
