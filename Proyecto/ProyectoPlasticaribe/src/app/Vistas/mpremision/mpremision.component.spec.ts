import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpremisionComponent } from './mpremision.component';

describe('MpremisionComponent', () => {
  let component: MpremisionComponent;
  let fixture: ComponentFixture<MpremisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpremisionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MpremisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
