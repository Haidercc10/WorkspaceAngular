import { TestBed } from '@angular/core/testing';

import { CodeBarService } from '../CodeBar/code-bar.service';

describe('CodeBarService', () => {
  let service: CodeBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
