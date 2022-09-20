/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Devoluciones_Productos_RollosComponent } from './Devoluciones_Productos_Rollos.component';

describe('Devoluciones_Productos_RollosComponent', () => {
  let component: Devoluciones_Productos_RollosComponent;
  let fixture: ComponentFixture<Devoluciones_Productos_RollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Devoluciones_Productos_RollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Devoluciones_Productos_RollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
