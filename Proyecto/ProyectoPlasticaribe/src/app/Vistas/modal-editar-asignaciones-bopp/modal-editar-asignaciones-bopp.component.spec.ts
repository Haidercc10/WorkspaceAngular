import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarAsignacionesBOPPComponent } from './modal-editar-asignaciones-bopp.component';

describe('ModalEditarAsignacionesBOPPComponent', () => {
  let component: ModalEditarAsignacionesBOPPComponent;
  let fixture: ComponentFixture<ModalEditarAsignacionesBOPPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditarAsignacionesBOPPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditarAsignacionesBOPPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
