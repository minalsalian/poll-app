import { TestBed } from '@angular/core/testing';

import { PollService } from './poll.service';

describe('PollService', () => {
  let service: PollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PollService);
    // clear localStorage to avoid cross-test pollution
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a poll and return a Poll object', () => {
    const poll = service.addPoll({ question: 'Test?', options: ['A', 'B'] });
    expect(poll).toBeTruthy();
    expect(poll.question).toBe('Test?');
    expect(poll.options.length).toBe(2);
  });

  it('should allow voting and prevent double voting via localStorage', () => {
    const poll = service.addPoll({ question: 'Vote?', options: ['Yes', 'No'] });
    const optionId = poll.options[0].id;

    const first = service.vote(poll.id, optionId);
    expect(first).toBeTrue();

    const second = service.vote(poll.id, optionId);
    expect(second).toBeFalse();
  });
});
