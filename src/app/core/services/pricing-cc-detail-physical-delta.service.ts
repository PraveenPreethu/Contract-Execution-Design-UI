import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcDetailPhysicalDelta } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcDetailPhysicalDeltaService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcDetailPhysicalDelta[]>                                   { return this.api.get<PricingCcDetailPhysicalDelta[]>('pricingccdetailphysicaldelta'); }
  getById(id: number): Observable<PricingCcDetailPhysicalDelta>                          { return this.api.getById<PricingCcDetailPhysicalDelta>('pricingccdetailphysicaldelta', id); }
  getByPricing(pricingId: string): Observable<PricingCcDetailPhysicalDelta[]>            { return this.api.get<PricingCcDetailPhysicalDelta[]>('pricingccdetailphysicaldelta', { pricingId }); }
  create(p: PricingCcDetailPhysicalDelta): Observable<PricingCcDetailPhysicalDelta>      { return this.api.post<PricingCcDetailPhysicalDelta>('pricingccdetailphysicaldelta', p); }
  update(id: number, p: PricingCcDetailPhysicalDelta): Observable<PricingCcDetailPhysicalDelta> { return this.api.put<PricingCcDetailPhysicalDelta>('pricingccdetailphysicaldelta', id, p); }
  delete(id: number): Observable<any>                                                    { return this.api.delete('pricingccdetailphysicaldelta', id); }
}
