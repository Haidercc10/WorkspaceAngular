import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroComponentComponent } from './registro-component.component';

describe('RegistroComponentComponent', () => {
  let component: RegistroComponentComponent;
  let fixture: ComponentFixture<RegistroComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
