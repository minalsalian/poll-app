import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../services/poll';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './poll-list.html',
  styleUrl: './poll-list.css',
})
export class PollListComponent implements OnInit {
  polls$: Observable<Poll[]>;
  newQuestion = '';
  newOptions: string[] = ['', ''];
  successMessage: string | null = null;
  showSuccess = false;
  @ViewChild('createToast', { static: false }) createToastRef?: ElementRef<HTMLDivElement>;

  constructor(private pollService: PollService, private router: Router) {
    this.polls$ = this.pollService.getPolls();
  }

  ngOnInit(): void {}

  trackByPollId(index: number, poll: Poll): string {
    return poll.id;
  }

  // trackBy for options inputs to keep form controls stable while typing
  trackByIndex(index: number, _item: string): number {
    return index;
  }

  addOption(): void {
    this.newOptions.push('');
  }

  removeOption(index: number): void {
    if (this.newOptions.length > 1) {
      this.newOptions.splice(index, 1);
    }
  }

  canSubmit(): boolean {
    const questionOk = !!this.newQuestion && this.newQuestion.trim().length > 0;
    const options = this.newOptions.map(o => o && o.trim()).filter(Boolean).map(o => o.toLowerCase());
    const unique = new Set(options).size === options.length;
    return questionOk && options.length >= 2 && unique;
  }

  hasDuplicateOptions(): boolean {
    const options = this.newOptions.map(o => o && o.trim()).filter(Boolean).map(o => o.toLowerCase());
    return new Set(options).size !== options.length;
  }

  submitPoll(): void {
    if (!this.canSubmit()) return;
    const options = this.newOptions.map(o => o.trim()).filter(Boolean) as string[];
    const poll = this.pollService.addPoll({ question: this.newQuestion.trim(), options });
    // reset form
    this.newQuestion = '';
    this.newOptions = ['', ''];
    // polls$ will update automatically via BehaviorSubject
    // show success toast and navigate to new poll immediately
    this.successMessage = 'Poll created successfully.';
    this.showSuccess = true;
    // If Bootstrap's Toast API is available, use it to show a nice toast
    setTimeout(() => this.showBootstrapToast(), 0);
    // hide the CSS fallback after 3s in any case
    setTimeout(() => (this.showSuccess = false), 3000);
    // navigate immediately
    this.router.navigate(['/poll', poll.id]);
  }

  private showBootstrapToast(): void {
    try {
      const el = this.createToastRef?.nativeElement;
      const win = window as any;
      if (!el) return;
      if (win?.bootstrap?.Toast) {
        // use Bootstrap Toast API
        const toastInstance = win.bootstrap.Toast.getOrCreateInstance(el, { autohide: true, delay: 3000 });
        toastInstance.show();
      } else {
        // fallback: rely on CSS show state (already handled via showSuccess)
      }
    } catch (e) {
      // ignore errors and fallback to CSS toast
    }
  }

  resetPolls(): void {
    this.pollService.resetPolls();
  }
}
