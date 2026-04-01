import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import {
  BillingCycleLookup, CommodityLookup, ComponentLookup, ContractStatusLookup,
  DeliveryModeLookup, FixedFloatLookup, IndexLookup, LoadZoneLookup,
  MarketLookup, MeterLookup, PremiseTypeLookup, PricingDaysLookup,
  ProductLookup, PublicationLookup, ResourceNodeLookup,
  VolumeConstraintLookup, VolumeFrequencyLookup
} from '../models';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private api = inject(ApiService);

  private cache = new Map<string, Observable<any>>();

  private cached<T>(key: string, fn: () => Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, fn().pipe(shareReplay(1)));
    }
    return this.cache.get(key)!;
  }

  billingCycles()       { return this.cached<BillingCycleLookup[]>('billingcycle', () => this.api.get<BillingCycleLookup[]>('billingcyclelookup')); }
  commodities()         { return this.cached<CommodityLookup[]>('commodity', () => this.api.get<CommodityLookup[]>('commoditylookup')); }
  components()          { return this.cached<ComponentLookup[]>('component', () => this.api.get<ComponentLookup[]>('componentlookup')); }
  contractStatuses()    { return this.cached<ContractStatusLookup[]>('cstatus', () => this.api.get<ContractStatusLookup[]>('contractstatuslookup')); }
  deliveryModes()       { return this.cached<DeliveryModeLookup[]>('deliverymode', () => this.api.get<DeliveryModeLookup[]>('deliverymodelookup')); }
  fixedFloats()         { return this.cached<FixedFloatLookup[]>('fixedfloat', () => this.api.get<FixedFloatLookup[]>('fixedfloatlookup')); }
  indexes()             { return this.cached<IndexLookup[]>('index', () => this.api.get<IndexLookup[]>('indexlookup')); }
  loadZones()           { return this.cached<LoadZoneLookup[]>('loadzone', () => this.api.get<LoadZoneLookup[]>('loadzonelookup')); }
  markets()             { return this.cached<MarketLookup[]>('market', () => this.api.get<MarketLookup[]>('marketlookup')); }
  meters()              { return this.cached<MeterLookup[]>('meter', () => this.api.get<MeterLookup[]>('meterlookup')); }
  premiseTypes()        { return this.cached<PremiseTypeLookup[]>('premisetype', () => this.api.get<PremiseTypeLookup[]>('premisetypelookup')); }
  pricingDays()         { return this.cached<PricingDaysLookup[]>('pricingdays', () => this.api.get<PricingDaysLookup[]>('pricingdayslookup')); }
  products()            { return this.cached<ProductLookup[]>('product', () => this.api.get<ProductLookup[]>('productlookup')); }
  publications()        { return this.cached<PublicationLookup[]>('publication', () => this.api.get<PublicationLookup[]>('publicationlookup')); }
  resourceNodes()       { return this.cached<ResourceNodeLookup[]>('resourcenode', () => this.api.get<ResourceNodeLookup[]>('resourcenodelookup')); }
  volumeConstraints()   { return this.cached<VolumeConstraintLookup[]>('volconstraint', () => this.api.get<VolumeConstraintLookup[]>('volumeconstraintlookup')); }
  volumeFrequencies()   { return this.cached<VolumeFrequencyLookup[]>('volfreq', () => this.api.get<VolumeFrequencyLookup[]>('volumefrequencylookup')); }
}
