export type Registrar = "GoDaddy" | "Namecheap" | "Dynadot" | "Unstoppable" | "Other";

export const REGISTRARS: Registrar[] = ["GoDaddy", "Namecheap", "Dynadot", "Unstoppable", "Other"];

export interface PortfolioDomain {
  id: string;
  domain: string;
  registrar: Registrar;
  /** ISO date (YYYY-MM-DD) or empty when unknown */
  expiry: string;
  costBasis?: number;
  addedAt: number;
}

export type ListingKind = "domain" | "bundle";

export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  domains: string[];
  /** Buy-now price in USD */
  price: number;
  /** Minimum acceptable bid in USD */
  minBid: number;
  seller: string;
  mine: boolean;
  demo: boolean;
  status: "active" | "sold" | "delisted";
  createdAt: number;
  expiry?: string;
  registrar?: Registrar;
  bundleId?: string;
}

export interface Bundle {
  id: string;
  name: string;
  domains: string[];
  createdAt: number;
  listed: boolean;
}

export type OfferType = "bid" | "offer";

export interface Offer {
  id: string;
  listingId: string;
  amount: number;
  from: string;
  type: OfferType;
  status: "pending" | "accepted" | "declined";
  /** true when made by the local user */
  mine: boolean;
  demo: boolean;
  createdAt: number;
}

export type ActivityType = "list" | "bid" | "offer" | "sale" | "accept" | "decline" | "delist" | "upload";

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  amount?: number;
  demo: boolean;
  createdAt: number;
}

export interface AppState {
  version: 1;
  seeded: boolean;
  portfolio: PortfolioDomain[];
  listings: Listing[];
  bundles: Bundle[];
  offers: Offer[];
  activity: Activity[];
}
