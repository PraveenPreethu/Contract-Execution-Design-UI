import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcFinancial } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcFinancialService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcFinancial[]>                             { return this.api.get<PricingCcFinancial[]>('pricingccfinancial'); }
  getById(id: string): Observable<PricingCcFinancial>                    { return this.api.getById<PricingCcFinancial>('pricingccfinancial', id); }
  getByCommitment(commitmentId: string): Observable<PricingCcFinancial[]>{ return this.api.get<PricingCcFinancial[]>('pricingccfinancial', { commitmentId }); }
  create(p: PricingCcFinancial): Observable<PricingCcFinancial>          { return this.api.post<PricingCcFinancial>('pricingccfinancial', p); }
  update(id: string, p: PricingCcFinancial): Observable<PricingCcFinancial> { return this.api.put<PricingCcFinancial>('pricingccfinancial', id, p); }
  delete(id: string): Observable<any>                                    { return this.api.delete('pricingccfinancial', id); }
}
