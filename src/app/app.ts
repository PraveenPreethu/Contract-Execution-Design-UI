import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BladeHostComponent } from './shared/components/blade-host/blade-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, MatTooltipModule, BladeHostComponent],
  template: `
    <div class="app-shell">

      <!-- ── Sidebar Nav ── -->
      <nav class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">
            <mat-icon>bolt</mat-icon>
          </div>
          <span class="logo-text">ContractX</span>
        </div>

        <div class="sidebar-links">
          <a class="nav-link active" routerLink="/contracts" matTooltip="Contracts" matTooltipPosition="right">
            <mat-icon>description</mat-icon>
            <span>Contracts</span>
          </a>
        </div>

        <div class="sidebar-footer">
          <div class="version-tag">v1.0</div>
        </div>
      </nav>

      <!-- ── Main ── -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Blade Host (renders all sliding panels) ── -->
      <app-blade-host></app-blade-host>

    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-base);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px 16px;
      border-bottom: 1px solid var(--border);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #007795, #00a8cc);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; font-size: 20px; }
    }

    .logo-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .sidebar-links {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: var(--radius);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
      cursor: pointer;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover  { background: rgba(0,153,191,0.08); color: var(--text-primary); }
      &.active { background: rgba(0,153,191,0.15); color: var(--primary-light); }
    }

    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
    }

    .version-tag {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.08em;
    }

    /* ── Main Content ── */
    .main-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class App {}
