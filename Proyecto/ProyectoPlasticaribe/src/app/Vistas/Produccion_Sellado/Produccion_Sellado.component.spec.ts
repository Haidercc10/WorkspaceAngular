/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Produccion_SelladoComponent } from './Produccion_Sellado.component';

describe('Produccion_SelladoComponent', () => {
  let component: Produccion_SelladoComponent;
  let fixture: ComponentFixture<Produccion_SelladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Produccion_SelladoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Produccion_SelladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
