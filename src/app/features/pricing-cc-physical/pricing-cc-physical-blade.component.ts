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

import { PricingCcPhysicalService } from '../../core/services/pricing-cc-physical.service';
import { PricingCcDetailPhysicalService } from '../../core/services/pricing-cc-detail-physical.service';
import { LookupService } from '../../core/services/lookup.service';
import { BladeService } from '../../core/services/blade.service';
import { PricingCcPhysical, PricingCcDetailPhysical, ComponentLookup, PricingDaysLookup, FixedFloatLookup } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PricingCcDetailPhysicalBladeComponent } from '../pricing-cc-detail-physical/pricing-cc-detail-physical-blade.component';

@Component({
  selector: 'app-pricing-cc-physical-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule
  ],
  templateUrl: './pricing-cc-physical-blade.component.html',
  styleUrl:    './pricing-cc-physical-blade.component.scss'
})
export class PricingCcPhysicalBladeComponent implements OnInit {
  @Input() mode:         'create' | 'edit' = 'create';
  @Input() pricingId?:   string;
  @Input() commitmentId?: string;
  @Input() contractId?:  string;
  @Input() onSaved?:     () => void;

  private fb          = inject(FormBuilder);
  private svc         = inject(PricingCcPhysicalService);
  private detailSvc   = inject(PricingCcDetailPhysicalService);
  private lookupSvc   = inject(LookupService);
  private bladeSvc    = inject(BladeService);
  private snackBar    = inject(MatSnackBar);
  private dialog      = inject(MatDialog);

  form!: FormGroup;
  loading    = signal(false);
  saving     = signal(false);
  details    = signal<PricingCcDetailPhysical[]>([]);
  components = signal<ComponentLookup[]>([]);
  pricingDays= signal<PricingDaysLookup[]>([]);
  fixedFloats= signal<FixedFloatLookup[]>([]);

  detailCols = ['id', 'pricingDate', 'binStart', 'binEnd', 'productCode', 'price', 'actions'];

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    if (this.mode === 'edit' && this.pricingId) {
      this.loadPricing();
      this.loadDetails();
    }
  }

  private generateId(prefix: string): string {
    const ts = Date.now().toString().slice(-7);
    return `${prefix}-${ts}`;
  }

  buildForm(): void {
    this.form = this.fb.group({
      pricingId:     [{ value: this.mode === 'create' ? this.generateId('PRP') : null, disabled: this.mode === 'edit' }],
      contractId:    [{ value: this.contractId || null, disabled: true }],
      commitmentId:  [{ value: this.commitmentId || null, disabled: true }],
      bundleId:      [null],
      costComponent: [null, Validators.required],
      cC_Level:      [null, Validators.required],
      cC_Formula:    [null],
      pricingDays:   [null, Validators.required],
      fixedFloat:    [null, Validators.required],
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
    const payload: PricingCcPhysical = { ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };

    const obs = this.mode === 'create'
      ? this.svc.create(payload)
      : this.svc.update(this.pricingId!, payload);

    obs.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showSuccess(this.mode === 'create' ? 'Pricing created' : 'Pricing updated');
        this.onSaved?.();
        if (this.mode === 'create') { this.mode = 'edit'; this.pricingId = saved.pricingId!; this.loadDetails(); }
      },
      error: () => { this.saving.set(false); this.showError('Failed to save pricing'); }
    });
  }

  openDetail(d?: PricingCcDetailPhysical): void {
    this.bladeSvc.open(PricingCcDetailPhysicalBladeComponent,
      d ? `Physical Detail — #${d.id}` : 'New Physical Detail',
      { mode: d ? 'edit' : 'create', id: d?.id, pricingId: this.pricingId, commitmentId: this.commitmentId, contractId: this.contractId, onSaved: () => this.loadDetails() }
    );
  }

  confirmDeleteDetail(d: PricingCcDetailPhysical, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Detail', message: `Delete physical detail #${d.id}?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok) {
        this.detailSvc.delete(d.id).subscribe({
          next: () => { this.showSuccess('Deleted'); this.loadDetails(); },
          error: () => this.showError('Failed to delete')
        });
      }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c && c.invalid && c.touched); }
  private showSuccess(m: string) { this.snackBar.open(m, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(m: string)   { this.snackBar.open(m, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
