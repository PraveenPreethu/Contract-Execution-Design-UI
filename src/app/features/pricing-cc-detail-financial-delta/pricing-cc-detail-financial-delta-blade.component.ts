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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PricingCcDetailFinancialDeltaService } from '../../core/services/pricing-cc-detail-financial-delta.service';
import { LookupService } from '../../core/services/lookup.service';
import { PricingCcDetailFinancialDelta, ProductLookup, FixedFloatLookup } from '../../core/models';

@Component({
  selector: 'app-pricing-cc-detail-financial-delta-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './pricing-cc-detail-financial-delta-blade.component.html',
  styleUrl:    './pricing-cc-detail-financial-delta-blade.component.scss'
})
export class PricingCcDetailFinancialDeltaBladeComponent implements OnInit {
  @Input() mode:          'create' | 'edit' = 'create';
  @Input() id?:           number;
  @Input() pricingId?:    string;
  @Input() commitmentId?: string;
  @Input() contractId?:   string;
  @Input() onSaved?:      () => void;

  private fb        = inject(FormBuilder);
  private svc       = inject(PricingCcDetailFinancialDeltaService);
  private lookupSvc = inject(LookupService);
  private snackBar  = inject(MatSnackBar);

  form!: FormGroup;
  loading     = signal(false);
  saving      = signal(false);
  products    = signal<ProductLookup[]>([]);
  fixedFloats = signal<FixedFloatLookup[]>([]);

  ngOnInit(): void {
    this.buildForm();
    this.lookupSvc.products().subscribe(d => this.products.set(d));
    this.lookupSvc.fixedFloats().subscribe(d => this.fixedFloats.set(d));
    if (this.mode === 'edit' && this.id != null) this.loadDetail();
  }

  buildForm(): void {
    this.form = this.fb.group({
      contractId:    [{ value: this.contractId   || null, disabled: true }],
      commitmentId:  [{ value: this.commitmentId || null, disabled: true }],
      pricingId:     [{ value: this.pricingId    || null, disabled: true }],
      runId:         [null],
      pricingDate:   [null, Validators.required],
      binStart:      [null, Validators.required],
      binEnd:        [null, Validators.required],
      productCode:   [null, Validators.required],
      fixedFloat:    [null, Validators.required],
      price:         [null, [Validators.required, Validators.min(0)]],
      curveBumped:   [null, Validators.required],
      bumpedPrice:   [null, [Validators.required, Validators.min(0)]],
      delta:         [null, Validators.required],
      asOfDate:      [null, Validators.required],
      createdUser:   [null],
      lastUpdateUser:[null]
    });
  }

  loadDetail(): void {
    this.loading.set(true);
    this.svc.getById(this.id!).subscribe({
      next: d => {
        this.form.patchValue({
          ...d,
          pricingDate: d.pricingDate ? new Date(d.pricingDate) : null,
          binStart:    d.binStart    ? new Date(d.binStart)    : null,
          binEnd:      d.binEnd      ? new Date(d.binEnd)      : null,
          asOfDate:    d.asOfDate    ? new Date(d.asOfDate)    : null,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.showError('Failed to load'); }
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: PricingCcDetailFinancialDelta = { id: this.id || 0, ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };
    const obs = this.mode === 'create' ? this.svc.create(payload) : this.svc.update(this.id!, payload);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showSuccess(this.mode === 'create' ? 'Delta created' : 'Delta updated'); this.onSaved?.(); },
      error: () => { this.saving.set(false); this.showError('Failed to save'); }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c && c.invalid && c.touched); }
  private showSuccess(m: string) { this.snackBar.open(m, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(m: string)   { this.snackBar.open(m, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
