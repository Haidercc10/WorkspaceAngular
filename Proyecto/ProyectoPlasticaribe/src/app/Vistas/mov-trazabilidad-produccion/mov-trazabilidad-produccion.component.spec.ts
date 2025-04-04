import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovTrazabilidadProduccionComponent } from './mov-trazabilidad-produccion.component';

describe('MovTrazabilidadProduccionComponent', () => {
  let component: MovTrazabilidadProduccionComponent;
  let fixture: ComponentFixture<MovTrazabilidadProduccionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovTrazabilidadProduccionComponent]
    });
    fixture = TestBed.createComponent(MovTrazabilidadProduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
