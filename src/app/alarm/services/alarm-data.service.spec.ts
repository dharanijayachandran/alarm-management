import { TestBed } from '@angular/core/testing';

import { AlarmDataService } from './alarm-data.service';

describe('AlarmDataService', () => {
  let service: AlarmDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlarmDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
