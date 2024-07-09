/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Salidas_PeletizadoComponent } from './Salidas_Peletizado.component';

describe('Salidas_PeletizadoComponent', () => {
  let component: Salidas_PeletizadoComponent;
  let fixture: ComponentFixture<Salidas_PeletizadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Salidas_PeletizadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Salidas_PeletizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
