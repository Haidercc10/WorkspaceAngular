/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Gestion_VistasComponent } from './Gestion_Vistas.component';

describe('Gestion_VistasComponent', () => {
  let component: Gestion_VistasComponent;
  let fixture: ComponentFixture<Gestion_VistasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gestion_VistasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gestion_VistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
