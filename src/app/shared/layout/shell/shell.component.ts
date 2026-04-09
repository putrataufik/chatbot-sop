import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .app-shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
    .main { flex: 1; min-width: 0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
  `]
})
export class ShellComponent {}