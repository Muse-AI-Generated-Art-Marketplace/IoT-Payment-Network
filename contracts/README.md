# IoT Payment Smart Contracts

Soroban smart contracts for managing pay-as-you-go IoT device sessions on the Stellar Network.

## Overview

This contract provides a complete payment solution for IoT devices with the following features:

- **Device Registration**: Register IoT devices with pricing and ownership
- **Session Management**: Start and end payment sessions with time-based billing
- **Deposit Handling**: Secure deposit management with minimum requirements
- **Fee Calculation**: Automatic fee calculation based on usage duration
- **Access Control**: Admin-only functions for configuration management

## Contract Architecture

### Core Data Structures

#### `DeviceInfo`
```rust
pub struct DeviceInfo {
    pub owner: Address,
    pub rate_per_second: i128,
    pub is_active: bool,
    pub metadata: Vec<BytesN<32>>,
}
```

#### `Session`
```rust
pub struct Session {
    pub id: BytesN<32>,
    pub device: Address,
    pub user: Address,
    pub start_time: u64,
    pub end_time: u64,
    pub deposit: i128,
    pub rate_per_second: i128,
    pub is_active: bool,
    pub total_cost: i128,
}
```

#### `GlobalConfig`
```rust
pub struct GlobalConfig {
    pub admin: Address,
    pub min_deposit: i128,
    pub max_session_duration: u64,
    pub fee_rate: i128,
}
```

## Key Functions

### Initialization
- `initialize(admin, min_deposit, max_duration, fee_rate)` - Set up contract configuration

### Device Management
- `register_device(device, owner, rate_per_second, metadata)` - Register new IoT device
- `get_device(device)` - Retrieve device information
- `update_device(device, owner, rate_per_second, is_active)` - Update device settings

### Session Management
- `start_session(user, device, duration, deposit)` - Begin new payment session
- `end_session(session_id, user)` - End session and calculate costs
- `get_session(session_id)` - Retrieve session information
- `get_active_sessions()` - List all active sessions

### Configuration
- `update_config(admin, min_deposit, max_duration, fee_rate)` - Update global settings

## Usage Examples

### Register a Device
```bash
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  --source YOUR_SECRET_KEY \
  -- \
  register_device \
  --device GDEVICE_ADDRESS \
  --owner GOWNER_ADDRESS \
  --rate_per_second 100
```

### Start a Session
```bash
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  --source USER_SECRET_KEY \
  -- \
  start_session \
  --user GUSER_ADDRESS \
  --device GDEVICE_ADDRESS \
  --duration 3600 \
  --deposit 5000
```

### End a Session
```bash
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  --source USER_SECRET_KEY \
  -- \
  end_session \
  --session_id SESSION_ID \
  --user GUSER_ADDRESS
```

## Development

### Prerequisites
- Rust 1.70.0+
- Soroban CLI
- WASM target: `rustup target add wasm32-unknown-unknown`

### Build
```bash
make build
```

### Test
```bash
make test
```

### Deploy
```bash
make deploy CONTRACT_ID=YOUR_CONTRACT_ID SECRET_KEY=YOUR_SECRET_KEY
```

## Error Codes

| Code | Description |
|------|-------------|
| 1 | Unauthorized access |
| 2 | Insufficient deposit |
| 3 | Session not found |
| 4 | Session already active |
| 5 | Invalid duration |
| 6 | Device not registered |
| 7 | Invalid rate |
| 8 | Calculation overflow |

## Security Considerations

- All state changes require proper authentication
- Deposit amounts are validated against minimum requirements
- Session durations are capped to prevent abuse
- Fee calculations include overflow protection
- Admin-only functions are protected by access control

## Integration

This contract is designed to work with:
- **Backend API**: TypeScript/Node.js service for web interface
- **DID Module**: Decentralized identity for device authentication
- **Frontend Dashboard**: User interface for session management

## License

MIT License - see [LICENSE](../LICENSE) file for details.
