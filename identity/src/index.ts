/**
 * IoT Stellar Identity Module
 * 
 * Provides Decentralized Identity (DID) and Verifiable Credentials
 * functionality for IoT devices on the Stellar Network.
 */

// Export types
export * from './types';

// Export main classes
export { DIDManager } from './did';
export { CredentialsManager } from './credentials';

// Export utilities
export * from './utils';

// Version
export const VERSION = '1.0.0';
