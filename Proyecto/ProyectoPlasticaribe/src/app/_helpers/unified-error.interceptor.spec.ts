import { TestBed } from '@angular/core/testing';

import { UnifiedErrorInterceptor } from './unified-error.interceptor';

describe('UnifiedErrorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UnifiedErrorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: UnifiedErrorInterceptor = TestBed.inject(UnifiedErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
