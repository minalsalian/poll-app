import { Routes } from '@angular/router';
import { PollListComponent } from './components/poll-list/poll-list';
import { PollDetailComponent } from './components/poll-detail/poll-detail';

export const routes: Routes = [
  { path: '', component: PollListComponent },
  { path: 'poll/:id', component: PollDetailComponent },
  { path: '**', redirectTo: '' }
];
