import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ContractService } from '../../../core/services/contract.service';
import { CommitmentService } from '../../../core/services/commitment.service';
import { LookupService } from '../../../core/services/lookup.service';
import { BladeService } from '../../../core/services/blade.service';
import { Contract, Commitment, CommodityLookup, ContractStatusLookup } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CommitmentBladeComponent } from '../../commitment/commitment-blade.component';

@Component({
  selector: 'app-contract-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule, MatDividerModule
  ],
  templateUrl: './contract-blade.component.html',
  styleUrl:    './contract-blade.component.scss'
})
export class ContractBladeComponent implements OnInit {
  @Input() mode:       'create' | 'edit' = 'create';
  @Input() contractId?: string;

  private fb          = inject(FormBuilder);
  private contractSvc = inject(ContractService);
  private commitmentSvc = inject(CommitmentService);
  private lookupSvc   = inject(LookupService);
  private bladeSvc    = inject(BladeService);
  private snackBar    = inject(MatSnackBar);
  private dialog      = inject(MatDialog);

  form!: FormGroup;
  loading     = signal(false);
  saving      = signal(false);
  commitments = signal<Commitment[]>([]);
  commodities = signal<CommodityLookup[]>([]);
  statuses    = signal<ContractStatusLookup[]>([]);

  commitmentColumns = ['commitmentId', 'productCode', 'marketCode', 'deliveryStart', 'deliveryEnd', 'actions'];

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    if (this.mode === 'edit' && this.contractId) {
      this.loadContract();
      this.loadCommitments();
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      contractId:     [{ value: null, disabled: this.mode === 'edit' }],
      customerId:     [null, [Validators.required, Validators.maxLength(50)]],
      commodityCode:  [null, Validators.required],
      contractStatus: [null, Validators.required],
      executionDate:  [null],
      createdUser:    [null],
      lastUpdateUser: [null]
    });
  }

  loadLookups(): void {
    this.lookupSvc.commodities().subscribe(d => this.commodities.set(d));
    this.lookupSvc.contractStatuses().subscribe(d => this.statuses.set(d));
  }

  loadContract(): void {
    this.loading.set(true);
    this.contractSvc.getById(this.contractId!).subscribe({
      next: c => {
        this.form.patchValue({
          ...c,
          executionDate: c.executionDate ? new Date(c.executionDate) : null
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.showError('Failed to load contract'); }
    });
  }

  loadCommitments(): void {
    this.commitmentSvc.getByContract(this.contractId!).subscribe({
      next: data => this.commitments.set(data),
      error: () => this.showError('Failed to load commitments')
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: Contract = { ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };

    const obs = this.mode === 'create'
      ? this.contractSvc.create(payload)
      : this.contractSvc.update(this.contractId!, payload);

    obs.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showSuccess(this.mode === 'create' ? 'Contract created' : 'Contract updated');
        if (this.mode === 'create') {
          this.mode = 'edit';
          this.contractId = saved.contractId!;
          this.loadCommitments();
        }
      },
      error: () => { this.saving.set(false); this.showError('Failed to save contract'); }
    });
  }

  openCreateCommitment(): void {
    this.bladeSvc.open(CommitmentBladeComponent, 'New Commitment', {
      mode: 'create', contractId: this.contractId,
      onSaved: () => this.loadCommitments()
    });
  }

  openEditCommitment(c: Commitment): void {
    this.bladeSvc.open(CommitmentBladeComponent, `Commitment — ${c.commitmentId}`, {
      mode: 'edit', commitmentId: c.commitmentId, contractId: this.contractId,
      onSaved: () => this.loadCommitments()
    });
  }

  confirmDeleteCommitment(c: Commitment, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Commitment', message: `Delete commitment "${c.commitmentId}"?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok && c.commitmentId) {
        this.commitmentSvc.delete(c.commitmentId).subscribe({
          next: () => { this.showSuccess('Commitment deleted'); this.loadCommitments(); },
          error: () => this.showError('Failed to delete commitment')
        });
      }
    });
  }

  getStatusClass(s: string | null): string {
    if (!s) return 'pending';
    const v = s.toLowerCase();
    if (v.includes('active'))   return 'active';
    if (v.includes('inactive') || v.includes('cancel')) return 'inactive';
    if (v.includes('execut'))   return 'executed';
    if (v.includes('expir'))    return 'expired';
    return 'pending';
  }

  isInvalid(f: string): boolean {
    const ctrl = this.form.get(f);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  private showSuccess(msg: string) { this.snackBar.open(msg, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(msg: string)   { this.snackBar.open(msg, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
