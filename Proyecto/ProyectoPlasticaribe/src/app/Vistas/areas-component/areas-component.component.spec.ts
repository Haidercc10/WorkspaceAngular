import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasComponentComponent } from './areas-component.component';

describe('AreasComponentComponent', () => {
  let component: AreasComponentComponent;
  let fixture: ComponentFixture<AreasComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreasComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreasComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
