import { SignJWT, jwtVerify, importJWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import {
  VerifiableCredential,
  CredentialSubject,
  Proof,
  CredentialVerificationResult,
  DIDDocument,
  ValidationError,
  CryptoError,
} from './types';

/**
 * Verifiable Credentials Manager for IoT devices
 */
export class CredentialsManager {
  private issuerDID: string;
  private issuerKeyPair: { publicKey: string; privateKey: string };

  constructor(issuerDID: string, issuerKeyPair: { publicKey: string; privateKey: string }) {
    this.issuerDID = issuerDID;
    this.issuerKeyPair = issuerKeyPair;
  }

  /**
   * Create a verifiable credential for an IoT device
   */
  async createDeviceCredential(
    subjectDID: string,
    deviceInfo: {
      deviceType: string;
      manufacturer?: string;
      model?: string;
      serialNumber?: string;
      firmware?: string;
      capabilities?: string[];
      [key: string]: any;
    },
    options?: {
      expiresInSeconds?: number;
      credentialId?: string;
    }
  ): Promise<VerifiableCredential> {
    const credentialId = options?.credentialId || uuidv4();
    const now = new Date();
    const expiresAt = options?.expiresInSeconds 
      ? new Date(now.getTime() + options.expiresInSeconds * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

    const credentialSubject: CredentialSubject = {
      id: subjectDID,
      ...deviceInfo,
    };

    const unsignedCredential: Omit<VerifiableCredential, 'proof'> = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/v1',
      ],
      type: ['VerifiableCredential', 'DeviceCredential'],
      issuer: this.issuerDID,
      issuanceDate: now.toISOString(),
      expirationDate: expiresAt.toISOString(),
      credentialSubject,
      id: `urn:uuid:${credentialId}`,
    };

    const proof = await this.createProof(unsignedCredential);
    
    return {
      ...unsignedCredential,
      proof,
    };
  }

  /**
   * Verify a verifiable credential
   */
  async verifyCredential(credential: VerifiableCredential): Promise<CredentialVerificationResult> {
    try {
      // Validate credential structure
      this.validateCredentialStructure(credential);

      // Verify proof/signature
      const proofValid = await this.verifyProof(credential);
      if (!proofValid) {
        return {
          valid: false,
          issuer: credential.issuer,
          subject: credential.credentialSubject.id || '',
          issuanceDate: credential.issuanceDate,
          error: 'Invalid signature',
        };
      }

      // Check expiration
      if (credential.expirationDate) {
        const expirationDate = new Date(credential.expirationDate);
        if (expirationDate < new Date()) {
          return {
            valid: false,
            issuer: credential.issuer,
            subject: credential.credentialSubject.id || '',
            issuanceDate: credential.issuanceDate,
            expires: credential.expirationDate,
            error: 'Credential has expired',
          };
        }
      }

      return {
        valid: true,
        issuer: credential.issuer,
        subject: credential.credentialSubject.id || '',
        issuanceDate: credential.issuanceDate,
        expires: credential.expirationDate,
      };
    } catch (error) {
      return {
        valid: false,
        issuer: credential.issuer,
        subject: credential.credentialSubject.id || '',
        issuanceDate: credential.issuanceDate,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a proof for a credential
   */
  private async createProof(credential: Omit<VerifiableCredential, 'proof'>): Promise<Proof> {
    const credentialHash = await this.hashCredential(credential);
    const now = new Date();

    // Create JWS signature
    const jwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: this.issuerKeyPair.publicKey,
      d: this.issuerKeyPair.privateKey,
    };

    const key = await importJWK(jwk);
    
    const jws = await new SignJWT({ hash: credentialHash })
      .setProtectedHeader({
        alg: 'EdDSA',
        typ: 'JWT',
        kid: `${this.issuerDID}#key-1`,
      })
      .setIssuedAt(now.getTime())
      .sign(key);

    return {
      type: 'Ed25519Signature2018',
      created: now.toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${this.issuerDID}#key-1`,
      jws,
    };
  }

  /**
   * Verify a proof
   */
  private async verifyProof(credential: VerifiableCredential): Promise<boolean> {
    if (!credential.proof) {
      return false;
    }

    try {
      // Extract public key from issuer DID
      const publicKey = this.extractPublicKeyFromDID(credential.issuer);
      
      // Create JWK from public key
      const jwk = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: publicKey,
      };

      const key = await importJWK(jwk);
      
      // Verify JWS
      const { payload } = await jwtVerify(credential.proof.jws!, key);
      
      // Verify hash matches
      const credentialCopy = { ...credential };
      delete credentialCopy.proof;
      const expectedHash = await this.hashCredential(credentialCopy);
      
      return (payload as any).hash === expectedHash;
    } catch (error) {
      throw new CryptoError(`Failed to verify proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash credential for signing
   */
  private async hashCredential(credential: Omit<VerifiableCredential, 'proof'>): Promise<string> {
    const credentialString = JSON.stringify(credential, Object.keys(credential).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(credentialString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate credential structure
   */
  private validateCredentialStructure(credential: VerifiableCredential): void {
    if (!credential['@context']) {
      throw new ValidationError('Missing @context');
    }

    if (!credential.type) {
      throw new ValidationError('Missing type');
    }

    if (!credential.issuer) {
      throw new ValidationError('Missing issuer');
    }

    if (!credential.issuanceDate) {
      throw new ValidationError('Missing issuanceDate');
    }

    if (!credential.credentialSubject) {
      throw new ValidationError('Missing credentialSubject');
    }

    if (!credential.proof) {
      throw new ValidationError('Missing proof');
    }
  }

  /**
   * Extract public key from DID
   */
  private extractPublicKeyFromDID(did: string): string {
    const parts = did.split(':');
    if (parts.length !== 4) {
      throw new ValidationError(`Invalid DID structure: ${did}`);
    }
    return parts[3];
  }

  /**
   * Create a device capability credential
   */
  async createCapabilityCredential(
    subjectDID: string,
    capabilities: string[],
    options?: {
      expiresInSeconds?: number;
      resource?: string;
      actions?: string[];
    }
  ): Promise<VerifiableCredential> {
    return this.createDeviceCredential(subjectDID, {
      deviceType: 'Capability',
      capabilities,
      resource: options?.resource,
      actions: options?.actions || [],
    }, options);
  }

  /**
   * Create a device ownership credential
   */
  async createOwnershipCredential(
    subjectDID: string,
    ownerDID: string,
    deviceInfo: {
      deviceType: string;
      manufacturer?: string;
      model?: string;
      serialNumber?: string;
    },
    options?: {
      expiresInSeconds?: number;
    }
  ): Promise<VerifiableCredential> {
    return this.createDeviceCredential(subjectDID, {
      deviceType: deviceInfo.deviceType,
      manufacturer: deviceInfo.manufacturer,
      model: deviceInfo.model,
      serialNumber: deviceInfo.serialNumber,
      owner: ownerDID,
    }, options);
  }

  /**
   * Batch verify multiple credentials
   */
  async verifyCredentialsBatch(credentials: VerifiableCredential[]): Promise<CredentialVerificationResult[]> {
    return Promise.all(credentials.map(credential => this.verifyCredential(credential)));
  }
}
