/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InventarioProductosPBDDComponent } from './Inventario-Productos-PBDD.component';

describe('InventarioProductosPBDDComponent', () => {
  let component: InventarioProductosPBDDComponent;
  let fixture: ComponentFixture<InventarioProductosPBDDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventarioProductosPBDDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioProductosPBDDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
