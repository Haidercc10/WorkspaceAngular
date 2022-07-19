import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearMateriasPrimasComponent } from './modal-crear-materias-primas.component';

describe('ModalCrearMateriasPrimasComponent', () => {
  let component: ModalCrearMateriasPrimasComponent;
  let fixture: ComponentFixture<ModalCrearMateriasPrimasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrearMateriasPrimasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCrearMateriasPrimasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
