/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrearBoppComponent } from './crear-bopp.component';

describe('CrearBoppComponent', () => {
  let component: CrearBoppComponent;
  let fixture: ComponentFixture<CrearBoppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearBoppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearBoppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
