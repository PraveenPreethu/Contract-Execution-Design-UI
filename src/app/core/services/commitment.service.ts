import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Commitment } from '../models';

@Injectable({ providedIn: 'root' })
export class CommitmentService {
  private api = inject(ApiService);

  getAll(): Observable<Commitment[]>                       { return this.api.get<Commitment[]>('commitment'); }
  getById(id: string): Observable<Commitment>              { return this.api.getById<Commitment>('commitment', id); }
  getByContract(contractId: string): Observable<Commitment[]> { return this.api.get<Commitment[]>('commitment', { contractId }); }
  create(c: Commitment): Observable<Commitment>            { return this.api.post<Commitment>('commitment', c); }
  update(id: string, c: Commitment): Observable<Commitment>{ return this.api.put<Commitment>('commitment', id, c); }
  delete(id: string): Observable<any>                      { return this.api.delete('commitment', id); }
}
