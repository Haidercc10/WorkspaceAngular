import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollosPesadosComponent } from './rollos-pesados.component';

describe('RollosPesadosComponent', () => {
  let component: RollosPesadosComponent;
  let fixture: ComponentFixture<RollosPesadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RollosPesadosComponent]
    });
    fixture = TestBed.createComponent(RollosPesadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
