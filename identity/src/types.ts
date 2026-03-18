/**
 * DID Document structure for IoT devices
 */

export interface DIDDocument {
  '@context': string | string[];
  id: string;
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationReference)[];
  assertionMethod?: (string | VerificationReference)[];
  keyAgreement?: (string | VerificationReference)[];
  capabilityInvocation?: (string | VerificationReference)[];
  capabilityDelegation?: (string | VerificationReference)[];
  service?: Service[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyJwk?: JsonWebKey;
  blockchainAccountId?: string;
}

export interface VerificationReference {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyJwk?: JsonWebKey;
  blockchainAccountId?: string;
  relationships?: string[];
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
  [key: string]: any;
}

export interface JsonWebKey {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  kid?: string;
  use?: string;
  alg?: string;
}

export interface DIDResolutionResult {
  didDocument: DIDDocument;
  didDocumentMetadata: DIDDocumentMetadata;
  didResolutionMetadata: DIDResolutionMetadata;
}

export interface DIDDocumentMetadata {
  created?: string;
  updated?: string;
  deactivated?: boolean;
  versionId?: string;
  nextUpdate?: string;
  nextVersionId?: string;
  equivalentId?: string[];
  canonicalId?: string;
}

export interface DIDResolutionMetadata {
  contentType?: string;
  error?: string;
  [key: string]: any;
}

export interface VerifiableCredential {
  '@context': string | string[];
  type: string | string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
  [key: string]: any;
}

export interface CredentialSubject {
  id?: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created?: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  proofValue?: string;
  [key: string]: any;
}

export interface DIDCreateOptions {
  network?: 'testnet' | 'public' | 'local';
  keypair?: StellarKeypair;
  services?: Service[];
  verificationMethods?: VerificationMethod[];
}

export interface StellarKeypair {
  publicKey: string;
  secretKey?: string;
}

export interface DeviceIdentity {
  did: string;
  publicKey: string;
  deviceType: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firmware?: string;
  capabilities?: string[];
  metadata?: Record<string, any>;
}

export interface IdentityVerificationResult {
  valid: boolean;
  did: string;
  publicKey: string;
  timestamp: number;
  error?: string;
}

export interface CredentialVerificationResult {
  valid: boolean;
  issuer: string;
  subject: string;
  issuanceDate: string;
  expires?: string;
  error?: string;
}

// Error types
export class DIDError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DIDError';
  }
}

export class ValidationError extends DIDError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ResolutionError extends DIDError {
  constructor(message: string) {
    super(message, 'RESOLUTION_ERROR');
    this.name = 'ResolutionError';
  }
}

export class CryptoError extends DIDError {
  constructor(message: string) {
    super(message, 'CRYPTO_ERROR');
    this.name = 'CryptoError';
  }
}
