/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Mov_ReposicionesComponent } from './Mov_Reposiciones.component';

describe('Mov_ReposicionesComponent', () => {
  let component: Mov_ReposicionesComponent;
  let fixture: ComponentFixture<Mov_ReposicionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mov_ReposicionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mov_ReposicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
