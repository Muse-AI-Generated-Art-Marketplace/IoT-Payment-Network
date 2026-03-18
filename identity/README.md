# IoT Stellar Identity Module

A comprehensive Decentralized Identity (DID) and Verifiable Credentials solution for IoT devices on the Stellar Network.

## Overview

This module provides:

- **DID Management**: Create, resolve, and manage DIDs for IoT devices
- **Verifiable Credentials**: Issue and verify device credentials
- **Stellar Integration**: Native integration with Stellar Network addresses
- **TypeScript Support**: Full TypeScript definitions and type safety

## Features

### DID Management
- Create DIDs from Stellar public keys
- Resolve DID documents
- Validate DID formats
- Convert between DIDs and Stellar addresses

### Verifiable Credentials
- Create device credentials
- Verify credential signatures
- Batch credential verification
- Support for various credential types

### Utilities
- DID validation and normalization
- Stellar address validation
- Crypto utilities for hashing and encoding
- Comprehensive error handling

## Installation

```bash
npm install @iot-stellar/identity
```

## Quick Start

### Create a Device DID

```typescript
import { DIDManager } from '@iot-stellar/identity';

const didManager = new DIDManager('testnet');

// Create a new device DID
const { did, didDocument, keypair } = didManager.createDeviceDID({
  deviceType: 'sensor',
  manufacturer: 'IoT Corp',
  model: 'TempSensor v2',
  capabilities: ['temperature', 'humidity'],
});

console.log('Device DID:', did);
console.log('Public Key:', keypair.publicKey);
```

### Resolve a DID

```typescript
// Resolve an existing DID
const resolutionResult = didManager.resolveDID('did:stellar:testnet:GABC...');

console.log('DID Document:', resolutionResult.didDocument);
```

### Create Verifiable Credentials

```typescript
import { CredentialsManager } from '@iot-stellar/identity';

const credentialsManager = new CredentialsManager(
  'did:stellar:testnet:GADMIN...',
  { publicKey: 'GADMIN...', privateKey: 'SADMIN...' }
);

// Create a device credential
const credential = await credentialsManager.createDeviceCredential(
  'did:stellar:testnet:GDEVICE...',
  {
    deviceType: 'sensor',
    manufacturer: 'IoT Corp',
    model: 'TempSensor v2',
    serialNumber: 'SN123456',
    capabilities: ['temperature', 'humidity'],
  },
  { expiresInSeconds: 86400 * 365 } // 1 year
);

console.log('Credential:', credential);
```

### Verify Credentials

```typescript
// Verify a credential
const verificationResult = await credentialsManager.verifyCredential(credential);

if (verificationResult.valid) {
  console.log('Credential is valid');
  console.log('Issuer:', verificationResult.issuer);
  console.log('Subject:', verificationResult.subject);
} else {
  console.log('Credential is invalid:', verificationResult.error);
}
```

## API Reference

### DIDManager

#### Constructor
```typescript
new DIDManager(network: 'testnet' | 'public' | 'local')
```

#### Methods

##### `createDeviceDID(deviceInfo, options?)`
Create a new DID for an IoT device.

**Parameters:**
- `deviceInfo`: Partial device information
- `options`: Optional configuration options

**Returns:**
- `did`: The generated DID
- `didDocument`: The DID document
- `keypair`: Stellar keypair

##### `resolveDID(did)`
Resolve a DID document.

**Parameters:**
- `did`: The DID to resolve

**Returns:** `DIDResolutionResult`

##### `verifyDeviceIdentity(deviceIdentity)`
Verify a device identity.

**Parameters:**
- `deviceIdentity`: Device identity object

**Returns:** `boolean`

### CredentialsManager

#### Constructor
```typescript
new CredentialsManager(issuerDID, issuerKeyPair)
```

#### Methods

##### `createDeviceCredential(subjectDID, deviceInfo, options?)`
Create a verifiable credential for a device.

**Parameters:**
- `subjectDID`: Subject's DID
- `deviceInfo`: Device information
- `options`: Optional configuration

**Returns:** `VerifiableCredential`

##### `verifyCredential(credential)`
Verify a verifiable credential.

**Parameters:**
- `credential`: The credential to verify

**Returns:** `CredentialVerificationResult`

##### `createCapabilityCredential(subjectDID, capabilities, options?)`
Create a capability credential.

**Parameters:**
- `subjectDID`: Subject's DID
- `capabilities`: Array of capabilities
- `options`: Optional configuration

**Returns:** `VerifiableCredential`

## Utilities

### DIDUtils

Static utility methods for DID operations:

```typescript
import { DIDUtils } from '@iot-stellar/identity';

// Validate DID format
DIDUtils.validateDID('did:stellar:testnet:GABC...'); // boolean

// Extract network
DIDUtils.extractNetwork('did:stellar:testnet:GABC...'); // 'testnet'

// Convert address to DID
DIDUtils.addressToDID('GABC...', 'testnet'); // 'did:stellar:testnet:GABC...'

// Compare DIDs
DIDUtils.compareDIDs('did:stellar:testnet:GABC...', 'did:stellar:TESTNET:GABC...'); // true
```

### ValidationUtils

Validate DID documents and credentials:

```typescript
import { ValidationUtils } from '@iot-stellar/identity';

// Validate DID document
const result = ValidationUtils.validateDIDDocument(didDocument);
if (!result.valid) {
  console.log('Errors:', result.errors);
}
```

### CryptoUtils

Cryptographic utilities:

```typescript
import { CryptoUtils } from '@iot-stellar/identity';

// Generate UUID
const uuid = CryptoUtils.generateUUID();

// Hash string
const hash = await CryptoUtils.hashString('data to hash');
```

## Error Handling

The module provides specific error types:

```typescript
import { DIDError, ValidationError, ResolutionError, CryptoError } from '@iot-stellar/identity';

try {
  // Some operation
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  } else if (error instanceof ResolutionError) {
    console.log('Resolution failed:', error.message);
  }
}
```

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm run test
```

### Lint
```bash
npm run lint
```

## Integration

This module is designed to work seamlessly with:

- **IoT Payment Contracts**: For device payment sessions
- **Backend API**: For web service integration
- **Frontend Dashboard**: For user interface components

## Security Considerations

- Private keys should never be exposed in frontend code
- Use secure key management practices
- Verify credentials before trusting them
- Implement proper access control

## License

MIT License - see [LICENSE](../LICENSE) file for details.
