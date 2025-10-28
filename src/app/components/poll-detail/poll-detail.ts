import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { Poll, PollOption } from '../../services/poll';
import { Observable, map, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './poll-detail.html',
  styleUrl: './poll-detail.css',
})
export class PollDetailComponent implements OnInit {
  poll$: Observable<Poll | undefined>;
  selectedOption: string | null = null;
  hasVoted = false;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService
  ) {
    this.poll$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.pollService.getPoll(id))
    );
  }

  ngOnInit(): void {
    this.poll$.subscribe(poll => {
      if (poll) {
        this.hasVoted = !!localStorage.getItem(`poll_${poll.id}_vote`);
      }
    });
  }

  submitVote(poll: Poll): void {
    if (this.selectedOption && !this.hasVoted) {
      if (this.pollService.vote(poll.id, this.selectedOption)) {
        this.hasVoted = true;
      }
    }
  }

  calculatePercentage(option: PollOption, poll: Poll): number {
    return this.pollService.calculatePercentage(option, poll);
  }

  getTotalVotes(poll: Poll): number {
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  }
}
