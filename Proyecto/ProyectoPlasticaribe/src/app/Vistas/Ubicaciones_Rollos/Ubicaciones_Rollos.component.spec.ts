/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Ubicaciones_RollosComponent } from './Ubicaciones_Rollos.component';

describe('Ubicaciones_RollosComponent', () => {
  let component: Ubicaciones_RollosComponent;
  let fixture: ComponentFixture<Ubicaciones_RollosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ubicaciones_RollosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ubicaciones_RollosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
