import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGenerarInventarioZeusComponent } from './modal-generar-inventario-zeus.component';

describe('ModalGenerarInventarioZeusComponent', () => {
  let component: ModalGenerarInventarioZeusComponent;
  let fixture: ComponentFixture<ModalGenerarInventarioZeusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalGenerarInventarioZeusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGenerarInventarioZeusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
