import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcompraComponent } from './ocompra.component';

describe('OcompraComponent', () => {
  let component: OcompraComponent;
  let fixture: ComponentFixture<OcompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OcompraComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OcompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
