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

import { PricingCcDetailPhysicalService } from '../../core/services/pricing-cc-detail-physical.service';
import { PricingCcDetailPhysicalDeltaService } from '../../core/services/pricing-cc-detail-physical-delta.service';
import { LookupService } from '../../core/services/lookup.service';
import { BladeService } from '../../core/services/blade.service';
import { PricingCcDetailPhysical, PricingCcDetailPhysicalDelta, ProductLookup } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PricingCcDetailPhysicalDeltaBladeComponent } from '../pricing-cc-detail-physical-delta/pricing-cc-detail-physical-delta-blade.component';

@Component({
  selector: 'app-pricing-cc-detail-physical-blade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule
  ],
  templateUrl: './pricing-cc-detail-physical-blade.component.html',
  styleUrl:    './pricing-cc-detail-physical-blade.component.scss'
})
export class PricingCcDetailPhysicalBladeComponent implements OnInit {
  @Input() mode:         'create' | 'edit' = 'create';
  @Input() id?:          number;
  @Input() pricingId?:   string;
  @Input() commitmentId?: string;
  @Input() contractId?:  string;
  @Input() onSaved?:     () => void;

  private fb        = inject(FormBuilder);
  private svc       = inject(PricingCcDetailPhysicalService);
  private deltaSvc  = inject(PricingCcDetailPhysicalDeltaService);
  private lookupSvc = inject(LookupService);
  private bladeSvc  = inject(BladeService);
  private snackBar  = inject(MatSnackBar);
  private dialog    = inject(MatDialog);

  form!: FormGroup;
  loading   = signal(false);
  saving    = signal(false);
  deltas    = signal<PricingCcDetailPhysicalDelta[]>([]);
  products  = signal<ProductLookup[]>([]);

  deltaCols = ['id', 'pricingDate', 'price', 'curveBumped', 'bumpedPrice', 'delta', 'actions'];

  ngOnInit(): void {
    this.buildForm();
    this.lookupSvc.products().subscribe(d => this.products.set(d));
    if (this.mode === 'edit' && this.id != null) { this.loadDetail(); this.loadDeltas(); }
  }

  buildForm(): void {
    this.form = this.fb.group({
      contractId:   [{ value: this.contractId  || null, disabled: true }],
      commitmentId: [{ value: this.commitmentId || null, disabled: true }],
      pricingId:    [{ value: this.pricingId   || null, disabled: true }],
      runId:        [null],
      pricingDate:  [null, Validators.required],
      binStart:     [null, Validators.required],
      binEnd:       [null, Validators.required],
      productCode:  [null, Validators.required],
      price:        [null, [Validators.required, Validators.min(0)]],
      asOfDate:     [null, Validators.required],
      createdUser:  [null],
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
      error: () => { this.loading.set(false); this.showError('Failed to load detail'); }
    });
  }

  loadDeltas(): void {
    if (this.pricingId) this.deltaSvc.getByPricing(this.pricingId).subscribe(d => this.deltas.set(d));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: PricingCcDetailPhysical = { id: this.id || 0, ...this.form.getRawValue(), lastUpdateDate: new Date().toISOString() };
    const obs = this.mode === 'create' ? this.svc.create(payload) : this.svc.update(this.id!, payload);
    obs.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.showSuccess(this.mode === 'create' ? 'Detail created' : 'Detail updated');
        this.onSaved?.();
        if (this.mode === 'create') { this.mode = 'edit'; this.id = saved.id; this.loadDeltas(); }
      },
      error: () => { this.saving.set(false); this.showError('Failed to save'); }
    });
  }

  openDelta(d?: PricingCcDetailPhysicalDelta): void {
    this.bladeSvc.open(PricingCcDetailPhysicalDeltaBladeComponent,
      d ? `Physical Delta — #${d.id}` : 'New Physical Delta',
      { mode: d ? 'edit' : 'create', id: d?.id, pricingId: this.pricingId, commitmentId: this.commitmentId, contractId: this.contractId, onSaved: () => this.loadDeltas() }
    );
  }

  confirmDeleteDelta(d: PricingCcDetailPhysicalDelta, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Delta', message: `Delete physical delta #${d.id}?`, action: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (ok) { this.deltaSvc.delete(d.id).subscribe({ next: () => { this.showSuccess('Deleted'); this.loadDeltas(); }, error: () => this.showError('Failed') }); }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c && c.invalid && c.touched); }
  private showSuccess(m: string) { this.snackBar.open(m, '✕', { duration: 3000, panelClass: ['snack-success'] }); }
  private showError(m: string)   { this.snackBar.open(m, '✕', { duration: 4000, panelClass: ['snack-error']   }); }
}
