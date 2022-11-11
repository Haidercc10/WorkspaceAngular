/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EliminarRollos_ExtrusionComponent } from './EliminarRollos_Extrusion.component';

describe('EliminarRollos_ExtrusionComponent', () => {
  let component: EliminarRollos_ExtrusionComponent;
  let fixture: ComponentFixture<EliminarRollos_ExtrusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EliminarRollos_ExtrusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarRollos_ExtrusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
