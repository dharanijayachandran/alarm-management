import { TestBed } from './node_modules/projects/user-management/src/app/account/services/account/node_modules/@angular/core/testing';

import { InterceptorService } from './interceptor.service';

describe('InterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InterceptorService = TestBed.get(InterceptorService);
    expect(service).toBeTruthy();
  });
});
