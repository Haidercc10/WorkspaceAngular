import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequerimientosCalidadComponent } from './requerimientos-calidad.component';

describe('RequerimientosCalidadComponent', () => {
  let component: RequerimientosCalidadComponent;
  let fixture: ComponentFixture<RequerimientosCalidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequerimientosCalidadComponent]
    });
    fixture = TestBed.createComponent(RequerimientosCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
