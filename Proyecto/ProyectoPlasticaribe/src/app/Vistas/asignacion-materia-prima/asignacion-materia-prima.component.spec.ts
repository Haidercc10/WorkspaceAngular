import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionMateriaPrimaComponent } from './asignacion-materia-prima.component';

describe('AsignacionMateriaPrimaComponent', () => {
  let component: AsignacionMateriaPrimaComponent;
  let fixture: ComponentFixture<AsignacionMateriaPrimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionMateriaPrimaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionMateriaPrimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
