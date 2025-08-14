import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AseguramientoCalidadComponent } from './aseguramiento-calidad.component';

describe('AseguramientoCalidadComponent', () => {
  let component: AseguramientoCalidadComponent;
  let fixture: ComponentFixture<AseguramientoCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AseguramientoCalidadComponent]
    });
    fixture = TestBed.createComponent(AseguramientoCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
