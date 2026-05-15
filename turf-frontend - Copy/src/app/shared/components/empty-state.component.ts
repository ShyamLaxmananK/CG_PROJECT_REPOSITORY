import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="glass-card empty-card">
      <div class="tag">Empty</div>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  readonly title = input('Nothing to show yet');
  readonly message = input('New activity will appear here as soon as records are added.');
}
