// ─── Lookup Models ─────────────────────────────────────────────────────────────
export interface BillingCycleLookup   { billingCycleCode: string; description: string; }
export interface CommodityLookup      { commodityCode: string; commodityName: string; createdDate?: string; }
export interface ComponentLookup      { componentCode: string; description: string; createdDate?: string; }
export interface ContractStatusLookup { statusCode: string; statusDescription: string; createdDate?: string; }
export interface DeliveryModeLookup   { deliveryModeCode: string; description: string; }
export interface FixedFloatLookup     { fixedFloatCode: string; description: string; }
export interface IndexLookup          { indexCode: string; indexName: string; productCode: string; createdDate?: string; }
export interface LoadZoneLookup       { loadZoneCode: string; description: string; createdDate?: string; }
export interface MarketLookup         { marketCode: string; marketName: string; createdDate?: string; }
export interface MeterLookup          { meterId: string; meterName: string; createdDate?: string; }
export interface PremiseTypeLookup    { premiseTypeCode: string; description: string; }
export interface PricingDaysLookup    { pricingDaysCode: string; description: string; }
export interface ProductLookup        { productCode: string; productName: string; commodityCode: string; createdDate?: string; }
export interface PublicationLookup    { publicationCode: string; publicationName: string; createdDate?: string; }
export interface ResourceNodeLookup   { resourceNodeCode: string; description: string; createdDate?: string; }
export interface VolumeConstraintLookup { constraintCode: string; description: string; }
export interface VolumeFrequencyLookup  { frequencyCode: string; description: string; }

// ─── Core Entities ─────────────────────────────────────────────────────────────
export interface Contract {
  contractId:      string | null;
  customerId:      string | null;
  commodityCode:   string | null;
  contractStatus:  string | null;
  executionDate:   string | null;
  createdAt:       string;
  createdUser:     string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface Commitment {
  commitmentId:     string | null;
  contractId:       string | null;
  productCode:      string | null;
  marketCode:       string | null;
  deliveryStart:    string;
  deliveryEnd:      string;
  meterIds:         string | null;
  volumeConstraint: string | null;
  volume:           number | null;
  volumeUnit:       string | null;
  volumeFrequency:  string | null;
  createdDate:      string;
  createdUser:      string | null;
  lastUpdateDate:   string | null;
  lastUpdateUser:   string | null;
}

export interface PricingCcPhysical {
  pricingId:     string | null;
  contractId:    string | null;
  commitmentId:  string | null;
  bundleId:      string | null;
  costComponent: string | null;
  cC_Level:      string | null;
  cC_Formula:    string | null;
  pricingDays:   string | null;
  fixedFloat:    string | null;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface PricingCcFinancial {
  pricingId:     string | null;
  contractId:    string | null;
  commitmentId:  string | null;
  bundleId:      string | null;
  costComponent: string | null;
  cC_Level:      string | null;
  fixedFloat:    string | null;
  price:         number | null;
  cC_Formula:    string | null;
  pricingDays:   string | null;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface PricingCcDetailPhysical {
  id:            number;
  contractId:    string | null;
  commitmentId:  string | null;
  pricingId:     string | null;
  runId:         string | null;
  pricingDate:   string;
  binStart:      string;
  binEnd:        string;
  productCode:   string | null;
  price:         number;
  asOfDate:      string;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface PricingCcDetailFinancial {
  id:            number;
  contractId:    string | null;
  commitmentId:  string | null;
  pricingId:     string | null;
  runId:         string | null;
  pricingDate:   string;
  binStart:      string;
  binEnd:        string;
  productCode:   string | null;
  fixedFloat:    string | null;
  price:         number;
  asOfDate:      string;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface PricingCcDetailPhysicalDelta {
  id:            number;
  contractId:    string | null;
  commitmentId:  string | null;
  pricingId:     string | null;
  runId:         string | null;
  pricingDate:   string;
  binStart:      string;
  binEnd:        string;
  productCode:   string | null;
  price:         number;
  curveBumped:   string | null;
  bumpedPrice:   number;
  delta:         number;
  asOfDate:      string;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

export interface PricingCcDetailFinancialDelta {
  id:            number;
  contractId:    string | null;
  commitmentId:  string | null;
  pricingId:     string | null;
  runId:         string | null;
  pricingDate:   string;
  binStart:      string;
  binEnd:        string;
  productCode:   string | null;
  fixedFloat:    string | null;
  price:         number;
  curveBumped:   string | null;
  bumpedPrice:   number;
  delta:         number;
  asOfDate:      string;
  createdDate:   string;
  createdUser:   string | null;
  lastUpdateDate:  string | null;
  lastUpdateUser:  string | null;
}

// ─── Blade Infrastructure ──────────────────────────────────────────────────────
import { Type } from '@angular/core';

export interface BladeConfig {
  id:        string;
  component: Type<any>;
  title:     string;
  inputs?:   Record<string, any>;
  width?:    string;
}
