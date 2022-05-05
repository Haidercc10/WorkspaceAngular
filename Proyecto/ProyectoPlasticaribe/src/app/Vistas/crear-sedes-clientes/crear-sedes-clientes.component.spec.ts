import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSedesClientesComponent } from './crear-sedes-clientes.component';

describe('CrearSedesClientesComponent', () => {
  let component: CrearSedesClientesComponent;
  let fixture: ComponentFixture<CrearSedesClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearSedesClientesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearSedesClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
