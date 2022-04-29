import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpsComponent } from './eps.component';

describe('EpsComponent', () => {
  let component: EpsComponent;
  let fixture: ComponentFixture<EpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
