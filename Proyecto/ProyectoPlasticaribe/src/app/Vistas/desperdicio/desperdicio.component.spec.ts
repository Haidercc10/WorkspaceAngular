import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesperdicioComponent } from './desperdicio.component';

describe('DesperdicioComponent', () => {
  let component: DesperdicioComponent;
  let fixture: ComponentFixture<DesperdicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesperdicioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesperdicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
