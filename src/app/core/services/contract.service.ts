import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Contract } from '../models';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private api = inject(ApiService);

  getAll(): Observable<Contract[]>                { return this.api.get<Contract[]>('contract'); }
  getById(id: string): Observable<Contract>       { return this.api.getById<Contract>('contract', id); }
  create(c: Contract): Observable<Contract>       { return this.api.post<Contract>('contract', c); }
  update(id: string, c: Contract): Observable<Contract> { return this.api.put<Contract>('contract', id, c); }
  delete(id: string): Observable<any>             { return this.api.delete('contract', id); }
}
