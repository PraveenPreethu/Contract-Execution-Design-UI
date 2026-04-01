import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcDetailFinancialDelta } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcDetailFinancialDeltaService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcDetailFinancialDelta[]>                                     { return this.api.get<PricingCcDetailFinancialDelta[]>('pricingccdetailfinancialdelta'); }
  getById(id: number): Observable<PricingCcDetailFinancialDelta>                            { return this.api.getById<PricingCcDetailFinancialDelta>('pricingccdetailfinancialdelta', id); }
  getByPricing(pricingId: string): Observable<PricingCcDetailFinancialDelta[]>              { return this.api.get<PricingCcDetailFinancialDelta[]>('pricingccdetailfinancialdelta', { pricingId }); }
  create(p: PricingCcDetailFinancialDelta): Observable<PricingCcDetailFinancialDelta>       { return this.api.post<PricingCcDetailFinancialDelta>('pricingccdetailfinancialdelta', p); }
  update(id: number, p: PricingCcDetailFinancialDelta): Observable<PricingCcDetailFinancialDelta> { return this.api.put<PricingCcDetailFinancialDelta>('pricingccdetailfinancialdelta', id, p); }
  delete(id: number): Observable<any>                                                      { return this.api.delete('pricingccdetailfinancialdelta', id); }
}
