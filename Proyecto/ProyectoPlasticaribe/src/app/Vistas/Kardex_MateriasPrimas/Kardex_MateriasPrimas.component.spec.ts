/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Kardex_MateriasPrimasComponent } from './Kardex_MateriasPrimas.component';

describe('Kardex_MateriasPrimasComponent', () => {
  let component: Kardex_MateriasPrimasComponent;
  let fixture: ComponentFixture<Kardex_MateriasPrimasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Kardex_MateriasPrimasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Kardex_MateriasPrimasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
