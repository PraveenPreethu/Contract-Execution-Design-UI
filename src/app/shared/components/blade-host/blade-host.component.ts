import { Component, inject, computed } from '@angular/core';
import { NgComponentOutlet, NgFor, NgIf, NgStyle } from '@angular/common';
import { BladeService } from '../../../core/services/blade.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-blade-host',
  standalone: true,
  imports: [NgComponentOutlet, NgFor, NgIf, NgStyle, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    @if (bladeService.hasBlades) {
      <div class="blade-backdrop" (click)="onBackdropClick()"></div>
    }
    @for (blade of bladeService.blades(); track blade.id; let i = $index; let last = $last) {
      <div
        class="blade-panel"
        [class.blade-stacked]="!last"
        [style.z-index]="900 + i"
        [style.right]="getRight(i)"
        [style.width]="blade.width || '540px'"
      >
        <!-- Blade Header -->
        <div class="blade-header">
          <div class="blade-header-left">
            @if (i > 0) {
              <button mat-icon-button class="back-btn" (click)="closeFrom(blade.id)"
                matTooltip="Close this panel">
                <mat-icon>chevron_right</mat-icon>
              </button>
            }
            <div class="blade-title-wrap">
              <span class="blade-breadcrumb">
                @for (b of bladeService.blades().slice(0, i); track b.id) {
                  <span class="crumb" (click)="closeFrom(blade.id)">{{ b.title }}</span>
                  <mat-icon class="crumb-sep">chevron_right</mat-icon>
                }
              </span>
              <h2 class="blade-title">{{ blade.title }}</h2>
            </div>
          </div>
          <div class="blade-header-right">
            @if (bladeService.blades().length > 1) {
              <button mat-icon-button (click)="bladeService.closeAll()" matTooltip="Close all panels">
                <mat-icon>close_fullscreen</mat-icon>
              </button>
            }
            <button mat-icon-button (click)="bladeService.close(blade.id)" matTooltip="Close panel">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Blade Content -->
        <div class="blade-content">
          <ng-container
            [ngComponentOutlet]="blade.component"
            [ngComponentOutletInputs]="blade.inputs || {}">
          </ng-container>
        </div>
      </div>
    }
  `,
  styles: [`
    .blade-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 899;
      animation: fadeIn 0.2s ease;
    }
    .blade-panel {
      position: fixed; top: 0; bottom: 0;
      background: var(--bg-blade);
      border-left: 1px solid var(--border);
      display: flex; flex-direction: column;
      box-shadow: -12px 0 40px rgba(0,0,0,0.5);
      animation: slideInRight 0.25s cubic-bezier(0.4,0,0.2,1);
      transition: right 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .blade-stacked {
      filter: brightness(0.85);
    }
    .blade-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 8px 0 16px; min-height: 56px;
      border-bottom: 1px solid var(--border);
      background: rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .blade-header-left { display: flex; align-items: center; gap: 4px; overflow: hidden; }
    .blade-header-right { display: flex; align-items: center; flex-shrink: 0; }
    .back-btn { color: var(--text-secondary) !important; }
    .blade-title-wrap { overflow: hidden; }
    .blade-breadcrumb {
      display: flex; align-items: center; gap: 2px;
      font-size: 10px; color: var(--text-muted);
      .crumb { cursor: pointer; &:hover { color: var(--primary-light); } }
      .crumb-sep { font-size: 12px; color: var(--text-muted); }
    }
    .blade-title {
      margin: 0; font-size: 15px; font-weight: 600;
      color: var(--text-primary); white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .blade-content {
      flex: 1; overflow-y: auto; overflow-x: hidden;
    }
  `]
})
export class BladeHostComponent {
  protected bladeService = inject(BladeService);

  getRight(index: number): string {
    const total = this.bladeService.blades().length;
    const offset = (total - 1 - index) * 16;
    return `${offset}px`;
  }

  onBackdropClick(): void {
    this.bladeService.close();
  }

  closeFrom(id: string): void {
    this.bladeService.closeFrom(id);
  }
}
