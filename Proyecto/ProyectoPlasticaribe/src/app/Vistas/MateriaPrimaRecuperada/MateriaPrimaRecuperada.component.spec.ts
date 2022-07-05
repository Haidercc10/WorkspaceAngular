/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MateriaPrimaRecuperadaComponent } from './MateriaPrimaRecuperada.component';

describe('MateriaPrimaRecuperadaComponent', () => {
  let component: MateriaPrimaRecuperadaComponent;
  let fixture: ComponentFixture<MateriaPrimaRecuperadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MateriaPrimaRecuperadaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriaPrimaRecuperadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
