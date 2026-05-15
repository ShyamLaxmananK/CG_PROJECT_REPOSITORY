import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="glass-card empty-card">
      <div class="tag">Loading</div>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
    </div>
  `
})
export class LoadingStateComponent {
  readonly title = input('Fetching data');
  readonly message = input('Just a moment while we bring in the latest updates.');
}
