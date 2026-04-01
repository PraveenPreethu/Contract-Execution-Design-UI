import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcDetailFinancial } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcDetailFinancialService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcDetailFinancial[]>                              { return this.api.get<PricingCcDetailFinancial[]>('pricingccdetailfinancial'); }
  getById(id: number): Observable<PricingCcDetailFinancial>                     { return this.api.getById<PricingCcDetailFinancial>('pricingccdetailfinancial', id); }
  getByPricing(pricingId: string): Observable<PricingCcDetailFinancial[]>       { return this.api.get<PricingCcDetailFinancial[]>('pricingccdetailfinancial', { pricingId }); }
  create(p: PricingCcDetailFinancial): Observable<PricingCcDetailFinancial>     { return this.api.post<PricingCcDetailFinancial>('pricingccdetailfinancial', p); }
  update(id: number, p: PricingCcDetailFinancial): Observable<PricingCcDetailFinancial> { return this.api.put<PricingCcDetailFinancial>('pricingccdetailfinancial', id, p); }
  delete(id: number): Observable<any>                                           { return this.api.delete('pricingccdetailfinancial', id); }
}
