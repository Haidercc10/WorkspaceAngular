/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

<<<<<<<< HEAD:Proyecto/ProyectoPlasticaribe/src/app/Vistas/Costos_CajaMenor/Costos_CajaMenor.component.spec.ts
import { Costos_CajaMenorComponent } from './Costos_CajaMenor.component';

describe('Costos_CajaMenorComponent', () => {
  let component: Costos_CajaMenorComponent;
  let fixture: ComponentFixture<Costos_CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Costos_CajaMenorComponent ]
========
import { CrearTipoSalida_CajaMenorComponent } from './CrearTipoSalida_CajaMenor.component';

describe('CrearTipoSalida_CajaMenorComponent', () => {
  let component: CrearTipoSalida_CajaMenorComponent;
  let fixture: ComponentFixture<CrearTipoSalida_CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTipoSalida_CajaMenorComponent ]
>>>>>>>> Cambios-Produccion:Proyecto/ProyectoPlasticaribe/src/app/Vistas/CrearTipoSalida_CajaMenor/CrearTipoSalida_CajaMenor.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<<< HEAD:Proyecto/ProyectoPlasticaribe/src/app/Vistas/Costos_CajaMenor/Costos_CajaMenor.component.spec.ts
    fixture = TestBed.createComponent(Costos_CajaMenorComponent);
========
    fixture = TestBed.createComponent(CrearTipoSalida_CajaMenorComponent);
>>>>>>>> Cambios-Produccion:Proyecto/ProyectoPlasticaribe/src/app/Vistas/CrearTipoSalida_CajaMenor/CrearTipoSalida_CajaMenor.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
