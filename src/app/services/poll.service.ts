import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Poll, PollOption, Vote } from './poll';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private polls: Poll[] = [];
  private polls$ = new BehaviorSubject<Poll[]>([]);
  private votes: Vote[] = [];
  private readonly STORAGE_KEY = 'polls_data_v1';

  constructor() {
    // Load polls from localStorage (if present) or seed sample data
    this.loadPolls();

    if (!this.polls.length) {
      this.addPoll({
        question: 'What\'s your favorite programming language?',
        options: ['JavaScript', 'Python', 'Java', 'C#']
      });
    }

    // Listen to storage events so updates in other tabs reflect here
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.STORAGE_KEY) {
          this.loadPolls();
        }
      });
    }
  }

  // Get all polls
  getPolls(): Observable<Poll[]> {
    return this.polls$.asObservable();
  }

  // Get a specific poll
  getPoll(id: string): Observable<Poll | undefined> {
    return this.polls$.pipe(
      map(polls => polls.find(poll => poll.id === id))
    );
  }

  // Add a new poll
  addPoll(data: { question: string; options: string[] }): Poll {
    const poll: Poll = {
      id: crypto.randomUUID(),
      question: data.question,
      options: data.options.map(text => ({
        id: crypto.randomUUID(),
        text,
        votes: 0
      })),
      created: new Date()
    };

    this.polls.push(poll);
    this.polls$.next(this.polls);
    this.savePolls();
    return poll;
  }

  // Cast a vote
  vote(pollId: string, optionId: string): boolean {
    const poll = this.polls.find(p => p.id === pollId);
    if (!poll) return false;

    const option = poll.options.find(o => o.id === optionId);
    if (!option) return false;

    // Check if user has already voted (using localStorage)
    const storageKey = `poll_${pollId}_vote`;
    if (localStorage.getItem(storageKey)) {
      return false;
    }

    // Record the vote
    option.votes++;
    this.votes.push({
      pollId,
      optionId,
      timestamp: new Date()
    });

    // Store the vote in localStorage to prevent multiple voting
    localStorage.setItem(storageKey, optionId);
    
    // Notify subscribers and persist
    this.polls$.next(this.polls);
    this.savePolls();
    return true;
  }

  /**
   * Reset polls and votes (clears localStorage and reseeds sample data)
   */
  resetPolls(): void {
    this.polls = [];
    this.votes = [];
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    this.polls$.next(this.polls);
    // reseed
    this.addPoll({
      question: 'What\'s your favorite programming language?',
      options: ['JavaScript', 'Python', 'Java', 'C#']
    });
  }

  private savePolls(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.polls));
    } catch (e) {
      // storage may be unavailable in some environments
    }
  }

  private loadPolls(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Poll[];
        // Convert created strings back to Date objects
        parsed.forEach(p => (p.created = new Date(p.created)));
        this.polls = parsed;
        this.polls$.next(this.polls);
        return;
      }
    } catch (e) {
      // ignore parse errors
    }
    this.polls = [];
    this.polls$.next(this.polls);
  }

  // Get results for a poll
  getResults(pollId: string): Observable<PollOption[]> {
    return this.polls$.pipe(
      map(polls => {
        const poll = polls.find(p => p.id === pollId);
        return poll ? poll.options : [];
      })
    );
  }

  // Calculate percentage for an option
  calculatePercentage(option: PollOption, poll: Poll): number {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100;
  }
}
