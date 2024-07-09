/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Movimientos_RollosComponent } from './Movimientos_Rollos.component';

describe('Movimientos_RollosComponent', () => {
  let component: Movimientos_RollosComponent;
  let fixture: ComponentFixture<Movimientos_RollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Movimientos_RollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Movimientos_RollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
