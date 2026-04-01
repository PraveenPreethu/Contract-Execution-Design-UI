import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PricingCcFinancialService } from '../../core/services/pricing-cc-financial.service';
import { PricingCcDetailFinancialService } from '../../core/services/pricing-cc-detail-financial.service';
import { LookupService } from '../../core/services/lookup.service';
import { BladeService } from '../../core/services/blade.service';
import { PricingCcFinancial, PricingCcDetailFinancial, ComponentLookup, PricingDaysLookup, FixedFloatLookup } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PricingCcDetailFinancialBladeComponent } from '../pricing-cc-detail-financial/pricing-cc-detail-financial-blade.component';

@Component({
  selector: 'app-pricing-cc-financial-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule
  ],
  templateUrl: './pricing-cc-financial-blade.component.html',
  styleUrl:    './pricing-cc-financial-blade.component.scss'
})
export class PricingCcFinancialBladeComponent implements OnInit {
  @Input() mode:         'create' | 'edit' = 'create';
  @Input() pricingId?:   string;
  @Input() commitmentId?: string;
  @Input() contractId?:  string;
  @Input() onSaved?:     () => void;

  private fb        = inject(FormBuilder);
  private svc       = inject(PricingCcFinancialService);
  private detailSvc = inject(PricingCcDetailFinancialService);
  private lookupSvc = inject(LookupService);
  private bladeSvc  = inject(BladeService);
  private snackBar  = inject(MatSnackBar);
  private dialog    = inject(MatDialog);

  form!: FormGroup;
  loading     = signal(false);
  saving      = signal(false);
  details     = signal<PricingCcDetailFinancial[]>([]);
  components  = signal<ComponentLookup[]>([]);
  pricingDays = signal<PricingDaysLookup[]>([]);
  fixedFloats = signal<FixedFloatLookup[]>([]);

  detailCols = ['id', 'pricingDate', 'binStart', 'binEnd', 'productCode', 'fixedFloat', 'price', 'actions'];

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    if (this.mode === 'edit' && this.pricingId) { this.loadPricing(); this.loadDetails(); }
  }

  private generateId(prefix: string): string {
    const ts = Date.now().toString().slice(-7);
    return `${prefix}-${ts}`;
  }

  buildForm(): void {
    this.form = this.fb.group({
      pricingId:     [{ value: this.mode === 'create' ? this.generateId('PRF') : null, disabled: this.mode === 'edit' }],
      contractId:    [{ value: this.contractId || null, disabled: true }],
      commitmentId:  [{ value: this.commitmentId || null, disabled: true }],
      bundleId:      [null],
      costComponent: [null, Validators.required],
      cC_Level:      [null, Validators.required],
      fixedFloat:    [null, Validators.required],
      price:         [null, [Validators.required, Validators.min(0)]],
      cC_Formula:    [null],
      pricingDays:   [null, Validators.required],
      createdUser:   [null],
      lastUpdateUser:[null]
    });
  }

  loadLookups(): void {
    this.lookupSvc.components().subscribe(d => this.components.set(d));
    this.lookupSvc.pricingDays().subscribe(d => this.pricingDays.set(d));
    this.lookupSvc.fixedFloats().subscribe(d => this.fixedFloats.set(d));
  }

  loadPricing(): void {
    this.loading.set(true);
    this.svc.getById(this.pricingId!).subscribe({
      next: p => { this.form.patchValue(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.showError('Failed to load pricing'); }
    });
  }

  loadDetails(): void {
    this.detailSvc.getByPricing(this.pricingId!).subscribe(d => this.details.set(d));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: PricingCcFinancial = { ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };
    const obs = this.mode === 'create' ? this.svc.create(payload) : this.svc.update(this.pricingId!, payload);
    obs.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showSuccess(this.mode === 'create' ? 'Pricing created' : 'Pricing updated');
        this.onSaved?.();
        if (this.mode === 'create') { this.mode = 'edit'; this.pricingId = saved.pricingId!; this.loadDetails(); }
      },
      error: () => { this.saving.set(false); this.showError('Failed to save'); }
    });
  }

  openDetail(d?: PricingCcDetailFinancial): void {
    this.bladeSvc.open(PricingCcDetailFinancialBladeComponent,
      d ? `Financial Detail — #${d.id}` : 'New Financial Detail',
      { mode: d ? 'edit' : 'create', id: d?.id, pricingId: this.pricingId, commitmentId: this.commitmentId, contractId: this.contractId, onSaved: () => this.loadDetails() }
    );
  }

  confirmDeleteDetail(d: PricingCcDetailFinancial, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Detail', message: `Delete financial detail #${d.id}?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok) { this.detailSvc.delete(d.id).subscribe({ next: () => { this.showSuccess('Deleted'); this.loadDetails(); }, error: () => this.showError('Failed') }); }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c && c.invalid && c.touched); }
  private showSuccess(m: string) { this.snackBar.open(m, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(m: string)   { this.snackBar.open(m, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
