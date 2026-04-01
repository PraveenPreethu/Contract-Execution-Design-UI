import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricingCcPhysical } from '../models';

@Injectable({ providedIn: 'root' })
export class PricingCcPhysicalService {
  private api = inject(ApiService);

  getAll(): Observable<PricingCcPhysical[]>                          { return this.api.get<PricingCcPhysical[]>('pricingccphysical'); }
  getById(id: string): Observable<PricingCcPhysical>                 { return this.api.getById<PricingCcPhysical>('pricingccphysical', id); }
  getByCommitment(commitmentId: string): Observable<PricingCcPhysical[]> { return this.api.get<PricingCcPhysical[]>('pricingccphysical', { commitmentId }); }
  create(p: PricingCcPhysical): Observable<PricingCcPhysical>        { return this.api.post<PricingCcPhysical>('pricingccphysical', p); }
  update(id: string, p: PricingCcPhysical): Observable<PricingCcPhysical> { return this.api.put<PricingCcPhysical>('pricingccphysical', id, p); }
  delete(id: string): Observable<any>                                { return this.api.delete('pricingccphysical', id); }
}
