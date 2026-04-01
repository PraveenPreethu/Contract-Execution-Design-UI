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

import { CommitmentService } from '../../core/services/commitment.service';
import { PricingCcPhysicalService } from '../../core/services/pricing-cc-physical.service';
import { PricingCcFinancialService } from '../../core/services/pricing-cc-financial.service';
import { LookupService } from '../../core/services/lookup.service';
import { BladeService } from '../../core/services/blade.service';
import {
  Commitment, PricingCcPhysical, PricingCcFinancial,
  ProductLookup, MarketLookup, MeterLookup,
  VolumeConstraintLookup, VolumeFrequencyLookup
} from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PricingCcPhysicalBladeComponent } from '../pricing-cc-physical/pricing-cc-physical-blade.component';
import { PricingCcFinancialBladeComponent } from '../pricing-cc-financial/pricing-cc-financial-blade.component';

@Component({
  selector: 'app-commitment-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule
  ],
  templateUrl: './commitment-blade.component.html',
  styleUrl:    './commitment-blade.component.scss'
})
export class CommitmentBladeComponent implements OnInit {
  @Input() mode:         'create' | 'edit' = 'create';
  @Input() commitmentId?: string;
  @Input() contractId?:   string;
  @Input() onSaved?:      () => void;

  private fb             = inject(FormBuilder);
  private commitmentSvc  = inject(CommitmentService);
  private physicalSvc    = inject(PricingCcPhysicalService);
  private financialSvc   = inject(PricingCcFinancialService);
  private lookupSvc      = inject(LookupService);
  private bladeSvc       = inject(BladeService);
  private snackBar       = inject(MatSnackBar);
  private dialog         = inject(MatDialog);

  form!: FormGroup;
  loading    = signal(false);
  saving     = signal(false);
  physicals  = signal<PricingCcPhysical[]>([]);
  financials = signal<PricingCcFinancial[]>([]);
  products   = signal<ProductLookup[]>([]);
  markets    = signal<MarketLookup[]>([]);
  meters     = signal<MeterLookup[]>([]);
  volConstraints = signal<VolumeConstraintLookup[]>([]);
  volFreqs       = signal<VolumeFrequencyLookup[]>([]);

  physCols = ['pricingId', 'costComponent', 'cC_Level', 'pricingDays', 'fixedFloat', 'actions'];
  finCols  = ['pricingId', 'costComponent', 'cC_Level', 'price', 'fixedFloat', 'actions'];

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    if (this.mode === 'edit' && this.commitmentId) {
      this.loadCommitment();
      this.loadPricing();
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      commitmentId:    [{ value: null, disabled: this.mode === 'edit' }],
      contractId:      [{ value: this.contractId || null, disabled: true }],
      productCode:     [null, Validators.required],
      marketCode:      [null, Validators.required],
      deliveryStart:   [null, Validators.required],
      deliveryEnd:     [null, Validators.required],
      meterIds:        [null],
      volumeConstraint:[null],
      volume:          [null, [Validators.min(0)]],
      volumeUnit:      [null],
      volumeFrequency: [null],
      createdUser:     [null],
      lastUpdateUser:  [null]
    });
  }

  loadLookups(): void {
    this.lookupSvc.products().subscribe(d => this.products.set(d));
    this.lookupSvc.markets().subscribe(d => this.markets.set(d));
    this.lookupSvc.meters().subscribe(d => this.meters.set(d));
    this.lookupSvc.volumeConstraints().subscribe(d => this.volConstraints.set(d));
    this.lookupSvc.volumeFrequencies().subscribe(d => this.volFreqs.set(d));
  }

  loadCommitment(): void {
    this.loading.set(true);
    this.commitmentSvc.getById(this.commitmentId!).subscribe({
      next: c => {
        this.form.patchValue({
          ...c,
          deliveryStart: c.deliveryStart ? new Date(c.deliveryStart) : null,
          deliveryEnd:   c.deliveryEnd   ? new Date(c.deliveryEnd)   : null
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.showError('Failed to load commitment'); }
    });
  }

  loadPricing(): void {
    this.physicalSvc.getByCommitment(this.commitmentId!).subscribe(d => this.physicals.set(d));
    this.financialSvc.getByCommitment(this.commitmentId!).subscribe(d => this.financials.set(d));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: Commitment = { ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };

    const obs = this.mode === 'create'
      ? this.commitmentSvc.create(payload)
      : this.commitmentSvc.update(this.commitmentId!, payload);

    obs.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showSuccess(this.mode === 'create' ? 'Commitment created' : 'Commitment updated');
        this.onSaved?.();
        if (this.mode === 'create') {
          this.mode = 'edit';
          this.commitmentId = saved.commitmentId!;
          this.loadPricing();
        }
      },
      error: () => { this.saving.set(false); this.showError('Failed to save commitment'); }
    });
  }

  openPhysical(p?: PricingCcPhysical): void {
    this.bladeSvc.open(PricingCcPhysicalBladeComponent,
      p ? `Physical Pricing — ${p.pricingId}` : 'New Physical Pricing',
      {
        mode: p ? 'edit' : 'create',
        pricingId: p?.pricingId,
        commitmentId: this.commitmentId,
        contractId: this.contractId,
        onSaved: () => this.loadPricing()
      }
    );
  }

  openFinancial(p?: PricingCcFinancial): void {
    this.bladeSvc.open(PricingCcFinancialBladeComponent,
      p ? `Financial Pricing — ${p.pricingId}` : 'New Financial Pricing',
      {
        mode: p ? 'edit' : 'create',
        pricingId: p?.pricingId,
        commitmentId: this.commitmentId,
        contractId: this.contractId,
        onSaved: () => this.loadPricing()
      }
    );
  }

  confirmDeletePhysical(p: PricingCcPhysical, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Physical Pricing', message: `Delete pricing "${p.pricingId}"?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok && p.pricingId) {
        this.physicalSvc.delete(p.pricingId).subscribe({
          next: () => { this.showSuccess('Deleted'); this.loadPricing(); },
          error: () => this.showError('Failed to delete')
        });
      }
    });
  }

  confirmDeleteFinancial(p: PricingCcFinancial, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Financial Pricing', message: `Delete pricing "${p.pricingId}"?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok && p.pricingId) {
        this.financialSvc.delete(p.pricingId).subscribe({
          next: () => { this.showSuccess('Deleted'); this.loadPricing(); },
          error: () => this.showError('Failed to delete')
        });
      }
    });
  }

  isInvalid(f: string): boolean {
    const ctrl = this.form.get(f);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  private showSuccess(msg: string) { this.snackBar.open(msg, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(msg: string)   { this.snackBar.open(msg, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
