/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

<<<<<<<< HEAD:Proyecto/ProyectoPlasticaribe/src/app/Vistas/CrearTipoSalida_CajaMenor/CrearTipoSalida_CajaMenor.component.spec.ts
import { CrearTipoSalida_CajaMenorComponent } from './CrearTipoSalida_CajaMenor.component';

describe('CrearTipoSalida_CajaMenorComponent', () => {
  let component: CrearTipoSalida_CajaMenorComponent;
  let fixture: ComponentFixture<CrearTipoSalida_CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTipoSalida_CajaMenorComponent ]
========
import { ControlCalidad_SelladoComponent } from './ControlCalidad_Sellado.component';

describe('ControlCalidad_SelladoComponent', () => {
  let component: ControlCalidad_SelladoComponent;
  let fixture: ComponentFixture<ControlCalidad_SelladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCalidad_SelladoComponent ]
>>>>>>>> master:Proyecto/ProyectoPlasticaribe/src/app/Vistas/ControlCalidad_Sellado/ControlCalidad_Sellado.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<<< HEAD:Proyecto/ProyectoPlasticaribe/src/app/Vistas/CrearTipoSalida_CajaMenor/CrearTipoSalida_CajaMenor.component.spec.ts
    fixture = TestBed.createComponent(CrearTipoSalida_CajaMenorComponent);
========
    fixture = TestBed.createComponent(ControlCalidad_SelladoComponent);
>>>>>>>> master:Proyecto/ProyectoPlasticaribe/src/app/Vistas/ControlCalidad_Sellado/ControlCalidad_Sellado.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
