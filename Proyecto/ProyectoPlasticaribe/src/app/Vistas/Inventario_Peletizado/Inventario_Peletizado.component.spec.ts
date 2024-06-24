/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Inventario_PeletizadoComponent } from './Inventario_Peletizado.component';

describe('Inventario_PeletizadoComponent', () => {
  let component: Inventario_PeletizadoComponent;
  let fixture: ComponentFixture<Inventario_PeletizadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Inventario_PeletizadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Inventario_PeletizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
