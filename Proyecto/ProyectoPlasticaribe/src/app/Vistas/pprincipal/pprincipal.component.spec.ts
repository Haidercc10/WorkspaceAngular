import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PprincipalComponent } from './pprincipal.component';

describe('PprincipalComponent', () => {
  let component: PprincipalComponent;
  let fixture: ComponentFixture<PprincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PprincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PprincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
