/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Orden_MaquilaComponent } from './Orden_Maquila.component';

describe('Orden_MaquilaComponent', () => {
  let component: Orden_MaquilaComponent;
  let fixture: ComponentFixture<Orden_MaquilaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Orden_MaquilaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Orden_MaquilaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
