import { Routes } from '@angular/router';
import { ContractListComponent } from './features/contracts/contract-list/contract-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'contracts', pathMatch: 'full' },
  { path: 'contracts', component: ContractListComponent },
  { path: '**', redirectTo: 'contracts' }
];
