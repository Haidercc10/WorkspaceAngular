/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CrearTipoSalida_CajaMenorComponent } from './CrearTipoSalida_CajaMenor.component';

describe('CrearTipoSalida_CajaMenorComponent', () => {
  let component: CrearTipoSalida_CajaMenorComponent;
  let fixture: ComponentFixture<CrearTipoSalida_CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTipoSalida_CajaMenorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTipoSalida_CajaMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
