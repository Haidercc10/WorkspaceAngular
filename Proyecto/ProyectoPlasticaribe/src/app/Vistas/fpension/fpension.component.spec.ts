import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FpensionComponent } from './fpension.component';

describe('FpensionComponent', () => {
  let component: FpensionComponent;
  let fixture: ComponentFixture<FpensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FpensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FpensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
