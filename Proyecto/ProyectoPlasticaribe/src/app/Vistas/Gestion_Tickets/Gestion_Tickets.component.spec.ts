/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Gestion_TicketsComponent } from './Gestion_Tickets.component';

describe('Gestion_TicketsComponent', () => {
  let component: Gestion_TicketsComponent;
  let fixture: ComponentFixture<Gestion_TicketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gestion_TicketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gestion_TicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
