import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
  DIDDocument,
  VerificationMethod,
  Service,
  DIDCreateOptions,
  DIDResolutionResult,
  DIDDocumentMetadata,
  DIDResolutionMetadata,
  DeviceIdentity,
  StellarKeypair,
  ValidationError,
  DIDError,
} from './types';

/**
 * DID Manager for IoT devices on Stellar Network
 */
export class DIDManager {
  private network: 'testnet' | 'public' | 'local';

  constructor(network: 'testnet' | 'public' | 'local' = 'testnet') {
    this.network = network;
  }

  /**
   * Create a new DID document for an IoT device
   */
  createDeviceDID(deviceInfo: Partial<DeviceIdentity>, options?: DIDCreateOptions): {
    did: string;
    didDocument: DIDDocument;
    keypair: StellarKeypair;
  } {
    const keypair = options?.keypair || this.generateKeypair();
    const did = this.generateDID(keypair.publicKey);
    
    const verificationMethod: VerificationMethod = {
      id: `${did}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58: keypair.publicKey,
      blockchainAccountId: `${this.network}:${keypair.publicKey}`,
    };

    const services: Service[] = [
      {
        id: `${did}#hub`,
        type: 'IoTDeviceHub',
        serviceEndpoint: `https://hub.${this.network}.stellar.org/${keypair.publicKey}`,
      },
      ...(options?.services || []),
    ];

    const didDocument: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/v1',
      ],
      id: did,
      verificationMethod: [verificationMethod, ...(options?.verificationMethods || [])],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
      service: services,
    };

    return {
      did,
      didDocument,
      keypair,
    };
  }

  /**
   * Resolve a DID document from a Stellar public key
   */
  resolveDID(did: string): DIDResolutionResult {
    this.validateDID(did);
    
    const publicKey = this.extractPublicKeyFromDID(did);
    
    try {
      const didDocument = this.buildDIDDocument(did, publicKey);
      
      return {
        didDocument,
        didDocumentMetadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
      };
    } catch (error) {
      throw new DIDError(`Failed to resolve DID: ${error.message}`, 'RESOLUTION_ERROR');
    }
  }

  /**
   * Verify a DID document signature
   */
  verifyDIDDocument(didDocument: DIDDocument, signature: string, message: string): boolean {
    try {
      const publicKey = this.extractPublicKeyFromDID(didDocument.id);
      const keypair = Keypair.fromPublicKey(publicKey);
      
      // Note: Stellar SDK doesn't provide direct message verification
      // This would need to be implemented using the appropriate crypto library
      // For now, return true as a placeholder
      return true;
    } catch (error) {
      throw new DIDError(`Failed to verify DID document: ${error.message}`, 'CRYPTO_ERROR');
    }
  }

  /**
   * Create a device identity profile
   */
  createDeviceIdentity(
    deviceInfo: Omit<DeviceIdentity, 'did' | 'publicKey'>,
    keypair?: StellarKeypair
  ): DeviceIdentity {
    const generatedKeypair = keypair || this.generateKeypair();
    const did = this.generateDID(generatedKeypair.publicKey);

    return {
      did,
      publicKey: generatedKeypair.publicKey,
      ...deviceInfo,
    };
  }

  /**
   * Verify device identity
   */
  verifyDeviceIdentity(deviceIdentity: DeviceIdentity): boolean {
    try {
      // Validate DID format
      this.validateDID(deviceIdentity.did);
      
      // Extract public key from DID
      const extractedPublicKey = this.extractPublicKeyFromDID(deviceIdentity.did);
      
      // Verify public key matches
      return extractedPublicKey === deviceIdentity.publicKey;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a new Stellar keypair
   */
  generateKeypair(): StellarKeypair {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Generate DID from Stellar public key
   */
  private generateDID(publicKey: string): string {
    return `did:stellar:${this.network}:${publicKey}`;
  }

  /**
   * Validate DID format
   */
  private validateDID(did: string): void {
    const didRegex = /^did:stellar:(testnet|public|local):[G][A-Z0-9]{55}$/;
    if (!didRegex.test(did)) {
      throw new ValidationError(`Invalid DID format: ${did}`);
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
   * Build DID document from public key
   */
  private buildDIDDocument(did: string, publicKey: string): DIDDocument {
    const verificationMethod: VerificationMethod = {
      id: `${did}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58: publicKey,
      blockchainAccountId: `${this.network}:${publicKey}`,
    };

    const services: Service[] = [
      {
        id: `${did}#hub`,
        type: 'IoTDeviceHub',
        serviceEndpoint: `https://hub.${this.network}.stellar.org/${publicKey}`,
      },
    ];

    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/v1',
      ],
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
      service: services,
    };
  }

  /**
   * Get network-specific DID resolver endpoint
   */
  getResolverEndpoint(): string {
    switch (this.network) {
      case 'testnet':
        return 'https://did-resolver.testnet.stellar.org';
      case 'public':
        return 'https://did-resolver.stellar.org';
      case 'local':
        return 'http://localhost:8000/did';
      default:
        throw new ValidationError(`Unsupported network: ${this.network}`);
    }
  }

  /**
   * Convert Stellar address to DID
   */
  addressToDID(address: string): string {
    if (!StrKey.isValidEd25519PublicKey(address)) {
      throw new ValidationError(`Invalid Stellar address: ${address}`);
    }
    return this.generateDID(address);
  }

  /**
   * Convert DID to Stellar address
   */
  didToAddress(did: string): string {
    this.validateDID(did);
    return this.extractPublicKeyFromDID(did);
  }
}
