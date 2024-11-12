/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EliminarRollos_ProduccionComponent } from './EliminarRollos_Produccion.component';

describe('EliminarRollos_ProduccionComponent', () => {
  let component: EliminarRollos_ProduccionComponent;
  let fixture: ComponentFixture<EliminarRollos_ProduccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EliminarRollos_ProduccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarRollos_ProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
