import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../services/poll';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './poll-list.html',
  styleUrl: './poll-list.css',
})
export class PollListComponent implements OnInit {
  polls$: Observable<Poll[]>;

  constructor(private pollService: PollService) {
    this.polls$ = this.pollService.getPolls();
  }

  ngOnInit(): void {}

  trackByPollId(index: number, poll: Poll): string {
    return poll.id;
  }
}
