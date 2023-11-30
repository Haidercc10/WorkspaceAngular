/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Correos_PaginaWebComponent } from './Correos_PaginaWeb.component';

describe('Correos_PaginaWebComponent', () => {
  let component: Correos_PaginaWebComponent;
  let fixture: ComponentFixture<Correos_PaginaWebComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Correos_PaginaWebComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Correos_PaginaWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
