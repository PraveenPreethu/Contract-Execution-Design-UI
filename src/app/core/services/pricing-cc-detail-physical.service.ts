import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcDetailPhysical } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcDetailPhysicalService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcDetailPhysical[]>                           { return this.api.get<PricingCcDetailPhysical[]>('pricingccdetailphysical'); }
  getById(id: number): Observable<PricingCcDetailPhysical>                  { return this.api.getById<PricingCcDetailPhysical>('pricingccdetailphysical', id); }
  getByPricing(pricingId: string): Observable<PricingCcDetailPhysical[]>    { return this.api.get<PricingCcDetailPhysical[]>('pricingccdetailphysical', { pricingId }); }
  create(p: PricingCcDetailPhysical): Observable<PricingCcDetailPhysical>   { return this.api.post<PricingCcDetailPhysical>('pricingccdetailphysical', p); }
  update(id: number, p: PricingCcDetailPhysical): Observable<PricingCcDetailPhysical> { return this.api.put<PricingCcDetailPhysical>('pricingccdetailphysical', id, p); }
  delete(id: number): Observable<any>                                       { return this.api.delete('pricingccdetailphysical', id); }
}
