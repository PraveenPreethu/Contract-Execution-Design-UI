import {
  Component, OnInit, inject, signal, computed, ViewChild
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

import { ContractService } from '../../../core/services/contract.service';
import { LookupService } from '../../../core/services/lookup.service';
import { BladeService } from '../../../core/services/blade.service';
import { Contract, ContractStatusLookup } from '../../../core/models';
import { ContractBladeComponent } from '../contract-blade/contract-blade.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatTooltipModule, MatMenuModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    MatSelectModule, MatChipsModule, DatePipe
  ],
  templateUrl: './contract-list.component.html',
  styleUrl:    './contract-list.component.scss'
})
export class ContractListComponent implements OnInit {
  private contractSvc = inject(ContractService);
  private lookupSvc   = inject(LookupService);
  private bladeSvc    = inject(BladeService);
  private snackBar    = inject(MatSnackBar);
  private dialog      = inject(MatDialog);

  @ViewChild(MatSort)      sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading     = signal(false);
  dataSource  = new MatTableDataSource<Contract>();
  statuses    = signal<ContractStatusLookup[]>([]);
  filterText  = '';
  filterStatus = '';

  displayedColumns = ['contractId', 'customerId', 'commodityCode', 'contractStatus', 'executionDate', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadLookups();
    this.loadContracts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort      = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.buildFilterPredicate();
  }

  loadContracts(): void {
    this.loading.set(true);
    this.contractSvc.getAll().subscribe({
      next:  data => { this.dataSource.data = data; this.loading.set(false); },
      error: ()   => { this.loading.set(false); this.showError('Failed to load contracts'); }
    });
  }

  loadLookups(): void {
    this.lookupSvc.contractStatuses().subscribe(s => this.statuses.set(s));
  }

  applyFilter(): void {
    const combined = `${this.filterText}__${this.filterStatus}`;
    this.dataSource.filter = combined.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  clearFilter(): void {
    this.filterText = '';
    this.filterStatus = '';
    this.applyFilter();
  }

  private buildFilterPredicate() {
    return (row: Contract, filter: string) => {
      const [text, status] = filter.split('__');
      const matchText = !text || [row.contractId, row.customerId, row.commodityCode]
        .some(v => v?.toLowerCase().includes(text));
      const matchStatus = !status || row.contractStatus?.toLowerCase() === status;
      return matchText && matchStatus;
    };
  }

  openCreate(): void {
    this.bladeSvc.open(ContractBladeComponent, 'New Contract', { mode: 'create' });
  }

  openEdit(contract: Contract): void {
    this.bladeSvc.open(ContractBladeComponent, `Contract — ${contract.contractId}`, {
      mode: 'edit', contractId: contract.contractId
    });
  }

  confirmDelete(contract: Contract, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:   'Delete Contract',
        message: `Are you sure you want to delete contract "${contract.contractId}"? This action cannot be undone.`,
        action:  'Delete',
        danger:  true
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && contract.contractId) {
        this.contractSvc.delete(contract.contractId).subscribe({
          next:  () => { this.showSuccess('Contract deleted'); this.loadContracts(); },
          error: ()  => this.showError('Failed to delete contract')
        });
      }
    });
  }

  getStatusClass(status: string | null): string {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('active'))   return 'active';
    if (s.includes('inactive') || s.includes('cancel')) return 'inactive';
    if (s.includes('execut'))   return 'executed';
    if (s.includes('expir'))    return 'expired';
    return 'pending';
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, '✕', { duration: 3000, panelClass: ['snack-success'] });
  }
  private showError(msg: string) {
    this.snackBar.open(msg, '✕', { duration: 4000, panelClass: ['snack-error'] });
  }

  get totalContracts()  { return this.dataSource.data.length; }
  get activeContracts() { return this.dataSource.data.filter(c => this.getStatusClass(c.contractStatus) === 'active').length; }
}
