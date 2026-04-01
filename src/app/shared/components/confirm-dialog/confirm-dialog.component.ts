import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title:   string;
  message: string;
  action?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <mat-icon [class]="data.danger ? 'icon-danger' : 'icon-info'">
          {{ data.danger ? 'warning' : 'info' }}
        </mat-icon>
        <h2>{{ data.title }}</h2>
      </div>
      <p class="confirm-msg">{{ data.message }}</p>
      <div class="confirm-actions">
        <button mat-stroked-button (click)="cancel()">Cancel</button>
        <button mat-flat-button [color]="data.danger ? 'warn' : 'primary'" (click)="confirm()">
          {{ data.action || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 8px; min-width: 360px; }
    .confirm-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
      h2 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
    }
    .icon-danger { color: var(--danger); font-size: 24px; }
    .icon-info   { color: var(--primary-light); font-size: 24px; }
    .confirm-msg { color: var(--text-secondary); font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
    .confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
  `]
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  protected data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  cancel()  { this.dialogRef.close(false); }
  confirm() { this.dialogRef.close(true);  }
}
