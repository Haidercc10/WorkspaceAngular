import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemaGestionCalidadComponent } from './sistema-gestion-calidad.component';

describe('SistemaGestionCalidadComponent', () => {
  let component: SistemaGestionCalidadComponent;
  let fixture: ComponentFixture<SistemaGestionCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SistemaGestionCalidadComponent]
    });
    fixture = TestBed.createComponent(SistemaGestionCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
