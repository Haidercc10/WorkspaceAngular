import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionVentasComponent } from './informacion-ventas.component';

describe('InformacionVentasComponent', () => {
  let component: InformacionVentasComponent;
  let fixture: ComponentFixture<InformacionVentasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InformacionVentasComponent]
    });
    fixture = TestBed.createComponent(InformacionVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
