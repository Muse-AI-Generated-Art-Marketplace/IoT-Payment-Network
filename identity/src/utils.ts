import { DIDDocument, VerificationMethod, Service } from './types';

/**
 * Utility functions for DID and credential operations
 */
export class DIDUtils {
  /**
   * Validate DID format
   */
  static validateDID(did: string): boolean {
    const didRegex = /^did:stellar:(testnet|public|local):[G][A-Z0-9]{55}$/;
    return didRegex.test(did);
  }

  /**
   * Extract network from DID
   */
  static extractNetwork(did: string): 'testnet' | 'public' | 'local' {
    const parts = did.split(':');
    if (parts.length !== 4) {
      throw new Error(`Invalid DID structure: ${did}`);
    }
    return parts[2] as 'testnet' | 'public' | 'local';
  }

  /**
   * Extract public key from DID
   */
  static extractPublicKey(did: string): string {
    const parts = did.split(':');
    if (parts.length !== 4) {
      throw new Error(`Invalid DID structure: ${did}`);
    }
    return parts[3];
  }

  /**
   * Check if a Stellar address is valid
   */
  static isValidStellarAddress(address: string): boolean {
    return /^[G][A-Z0-9]{55}$/.test(address);
  }

  /**
   * Generate DID from Stellar address
   */
  static addressToDID(address: string, network: 'testnet' | 'public' | 'local' = 'testnet'): string {
    if (!this.isValidStellarAddress(address)) {
      throw new Error(`Invalid Stellar address: ${address}`);
    }
    return `did:stellar:${network}:${address}`;
  }

  /**
   * Convert DID to Stellar address
   */
  static didToAddress(did: string): string {
    return this.extractPublicKey(did);
  }

  /**
   * Find verification method by ID
   */
  static findVerificationMethod(didDocument: DIDDocument, methodId: string): VerificationMethod | undefined {
    return didDocument.verificationMethod?.find(method => method.id === methodId);
  }

  /**
   * Find service by ID
   */
  static findService(didDocument: DIDDocument, serviceId: string): Service | undefined {
    return didDocument.service?.find(service => service.id === serviceId);
  }

  /**
   * Get all verification methods for a specific type
   */
  static getVerificationMethodsByType(didDocument: DIDDocument, type: string): VerificationMethod[] {
    return didDocument.verificationMethod?.filter(method => method.type === type) || [];
  }

  /**
   * Check if DID document has a specific verification method
   */
  static hasVerificationMethod(didDocument: DIDDocument, methodId: string): boolean {
    return this.findVerificationMethod(didDocument, methodId) !== undefined;
  }

  /**
   * Check if DID document has a specific service
   */
  static hasService(didDocument: DIDDocument, serviceId: string): boolean {
    return this.findService(didDocument, serviceId) !== undefined;
  }

  /**
   * Normalize DID (lowercase)
   */
  static normalizeDID(did: string): string {
    return did.toLowerCase();
  }

  /**
   * Compare two DIDs (case-insensitive)
   */
  static compareDIDs(did1: string, did2: string): boolean {
    return this.normalizeDID(did1) === this.normalizeDID(did2);
  }

  /**
   * Generate a unique service ID
   */
  static generateServiceId(did: string, serviceType: string): string {
    return `${did}#${serviceType}-${Date.now()}`;
  }

  /**
   * Generate a unique verification method ID
   */
  static generateVerificationMethodId(did: string, keyType: string): string {
    return `${did}#${keyType}-${Date.now()}`;
  }

  /**
   * Check if a string is a valid DID
   */
  static isDID(value: string): boolean {
    return value.startsWith('did:stellar:') && this.validateDID(value);
  }

  /**
   * Check if a string is a valid Stellar address
   */
  static isStellarAddress(value: string): boolean {
    return this.isValidStellarAddress(value);
  }

  /**
   * Convert between DID and address formats
   */
  static convertFormat(value: string, network: 'testnet' | 'public' | 'local' = 'testnet'): string {
    if (this.isDID(value)) {
      return this.didToAddress(value);
    } else if (this.isStellarAddress(value)) {
      return this.addressToDID(value, network);
    } else {
      throw new Error(`Value is neither a valid DID nor Stellar address: ${value}`);
    }
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate DID document structure
   */
  static validateDIDDocument(didDocument: DIDDocument): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!didDocument['@context']) {
      errors.push('Missing @context');
    }

    if (!didDocument.id) {
      errors.push('Missing id');
    } else if (!DIDUtils.validateDID(didDocument.id)) {
      errors.push('Invalid DID format');
    }

    if (!didDocument.verificationMethod || didDocument.verificationMethod.length === 0) {
      errors.push('Missing verificationMethod');
    }

    // Validate verification methods
    didDocument.verificationMethod?.forEach((method, index) => {
      if (!method.id) {
        errors.push(`Verification method ${index}: Missing id`);
      }
      if (!method.type) {
        errors.push(`Verification method ${index}: Missing type`);
      }
      if (!method.controller) {
        errors.push(`Verification method ${index}: Missing controller`);
      }
      if (!method.publicKeyBase58 && !method.publicKeyJwk && !method.blockchainAccountId) {
        errors.push(`Verification method ${index}: Missing public key material`);
      }
    });

    // Validate services
    didDocument.service?.forEach((service, index) => {
      if (!service.id) {
        errors.push(`Service ${index}: Missing id`);
      }
      if (!service.type) {
        errors.push(`Service ${index}: Missing type`);
      }
      if (!service.serviceEndpoint) {
        errors.push(`Service ${index}: Missing serviceEndpoint`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate credential subject
   */
  static validateCredentialSubject(subject: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!subject || typeof subject !== 'object') {
      errors.push('Credential subject must be an object');
      return { valid: false, errors };
    }

    // Check if subject has an id and if it's a valid DID
    if (subject.id && !DIDUtils.validateDID(subject.id)) {
      errors.push('Invalid subject DID');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Crypto utilities
 */
export class CryptoUtils {
  /**
   * Generate a random UUID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a random string
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash a string using SHA-256
   */
  static async hashString(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Convert base64 to base64url
   */
  static base64ToBase64url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Convert base64url to base64
   */
  static base64urlToBase64(base64url: string): string {
    base64url += '='.repeat((4 - base64url.length % 4) % 4);
    return base64url.replace(/-/g, '+').replace(/_/g, '/');
  }
}
