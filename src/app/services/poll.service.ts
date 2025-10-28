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

  constructor() {
    // Initialize with some sample data
    this.addPoll({
      question: 'What\'s your favorite programming language?',
      options: ['JavaScript', 'Python', 'Java', 'C#']
    });
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
    
    // Notify subscribers
    this.polls$.next(this.polls);
    return true;
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
