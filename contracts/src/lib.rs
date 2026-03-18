#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, env, symbol_short, Address, BytesN,
    ConversionError, Env, IntoVal, TryFromVal, TryIntoVal, Vec,
};

// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    Unauthorized = 1,
    InsufficientDeposit = 2,
    SessionNotFound = 3,
    SessionAlreadyActive = 4,
    InvalidDuration = 5,
    DeviceNotRegistered = 6,
    InvalidRate = 7,
    CalculationOverflow = 8,
}

// Contract data keys
#[contracttype]
pub enum DataKey {
    Admin,
    Device(Address),
    Session(BytesN<32>),
    ActiveSessions,
    GlobalConfig,
}

// Device registration info
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DeviceInfo {
    pub owner: Address,
    pub rate_per_second: i128, // Price in stroops (1e-7 XLM)
    pub is_active: bool,
    pub metadata: Vec<BytesN<32>>, // Additional device metadata
}

// Session information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
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

// Global configuration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GlobalConfig {
    pub admin: Address,
    pub min_deposit: i128,
    pub max_session_duration: u64,
    pub fee_rate: i128, // Fee percentage in basis points (10000 = 100%)
}

// Contract implementation
#[contract]
pub struct IoTPaymentContract;

#[contractimpl]
impl IoTPaymentContract {
    /// Initialize the contract with admin address
    pub fn initialize(env: Env, admin: Address, min_deposit: i128, max_duration: u64, fee_rate: i128) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        admin.require_auth();

        let config = GlobalConfig {
            admin: admin.clone(),
            min_deposit,
            max_session_duration: max_duration,
            fee_rate,
        };

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::GlobalConfig, &config);
    }

    /// Register a new IoT device
    pub fn register_device(env: Env, device: Address, owner: Address, rate_per_second: i128, metadata: Vec<BytesN<32>>) {
        let config: GlobalConfig = env.storage().instance().get(&DataKey::GlobalConfig).unwrap();
        config.admin.require_auth();

        if rate_per_second <= 0 {
            panic!("invalid rate");
        }

        let device_info = DeviceInfo {
            owner: owner.clone(),
            rate_per_second,
            is_active: true,
            metadata,
        };

        env.storage().instance().set(&DataKey::Device(device), &device_info);
    }

    /// Start a new payment session
    pub fn start_session(
        env: Env,
        user: Address,
        device: Address,
        duration: u64,
        deposit: i128,
    ) -> Result<BytesN<32>, Error> {
        user.require_auth();

        let config: GlobalConfig = env.storage().instance().get(&DataKey::GlobalConfig).unwrap();
        
        if deposit < config.min_deposit {
            return Err(Error::InsufficientDeposit);
        }

        if duration > config.max_session_duration {
            return Err(Error::InvalidDuration);
        }

        let device_info: Option<DeviceInfo> = env.storage().instance().get(&DataKey::Device(device.clone()));
        if device_info.is_none() {
            return Err(Error::DeviceNotRegistered);
        }

        let device_info = device_info.unwrap();
        if !device_info.is_active {
            return Err(Error::DeviceNotRegistered);
        }

        // Generate unique session ID
        let session_id = env.crypto().sha256(&(
            &user,
            &device,
            &env.ledger().timestamp(),
            &env.ledger().sequence(),
        ).into_val(env));

        // Check if session already exists
        if env.storage().instance().has(&DataKey::Session(session_id)) {
            return Err(Error::SessionAlreadyActive);
        }

        let start_time = env.ledger().timestamp();
        let end_time = start_time + duration;

        let session = Session {
            id: session_id,
            device: device.clone(),
            user: user.clone(),
            start_time,
            end_time,
            deposit,
            rate_per_second: device_info.rate_per_second,
            is_active: true,
            total_cost: 0,
        };

        env.storage().instance().set(&DataKey::Session(session_id), &session);
        
        // Add to active sessions
        let mut active_sessions: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::ActiveSessions).unwrap_or(Vec::new(env));
        active_sessions.push_back(session_id);
        env.storage().instance().set(&DataKey::ActiveSessions, &active_sessions);

        Ok(session_id)
    }

    /// End a payment session and calculate final cost
    pub fn end_session(env: Env, session_id: BytesN<32>, user: Address) -> Result<Session, Error> {
        user.require_auth();

        let mut session: Option<Session> = env.storage().instance().get(&DataKey::Session(session_id));
        if session.is_none() {
            return Err(Error::SessionNotFound);
        }

        let mut session = session.unwrap();
        if session.user != user {
            return Err(Error::Unauthorized);
        }

        if !session.is_active {
            return Err(Error::SessionNotFound);
        }

        let current_time = env.ledger().timestamp();
        let actual_duration = if current_time > session.end_time {
            session.end_time - session.start_time
        } else {
            current_time - session.start_time
        };

        // Calculate total cost
        let base_cost = session.rate_per_second.checked_mul(actual_duration as i128)
            .ok_or(Error::CalculationOverflow)?;
        
        let config: GlobalConfig = env.storage().instance().get(&DataKey::GlobalConfig).unwrap();
        let fee = base_cost.checked_mul(config.fee_rate)
            .ok_or(Error::CalculationOverflow)?
            .checked_div(10000)
            .ok_or(Error::CalculationOverflow)?;
        
        session.total_cost = base_cost.checked_add(fee)
            .ok_or(Error::CalculationOverflow)?;
        
        session.is_active = false;

        // Update session
        env.storage().instance().set(&DataKey::Session(session_id), &session);

        // Remove from active sessions
        let mut active_sessions: Vec<BytesN<32>> = env.storage().instance().get(&DataKey::ActiveSessions).unwrap_or(Vec::new(env));
        active_sessions = active_sessions.iter()
            .filter(|id| *id != session_id)
            .collect();
        env.storage().instance().set(&DataKey::ActiveSessions, &active_sessions);

        Ok(session)
    }

    /// Get session information
    pub fn get_session(env: Env, session_id: BytesN<32>) -> Option<Session> {
        env.storage().instance().get(&DataKey::Session(session_id))
    }

    /// Get device information
    pub fn get_device(env: Env, device: Address) -> Option<DeviceInfo> {
        env.storage().instance().get(&DataKey::Device(device))
    }

    /// Get all active sessions
    pub fn get_active_sessions(env: Env) -> Vec<BytesN<32>> {
        env.storage().instance().get(&DataKey::ActiveSessions).unwrap_or(Vec::new(env))
    }

    /// Update device information (admin only)
    pub fn update_device(env: Env, device: Address, owner: Address, rate_per_second: i128, is_active: bool) -> Result<(), Error> {
        let config: GlobalConfig = env.storage().instance().get(&DataKey::GlobalConfig).unwrap();
        config.admin.require_auth();

        if rate_per_second <= 0 {
            return Err(Error::InvalidRate);
        }

        let existing_device: Option<DeviceInfo> = env.storage().instance().get(&DataKey::Device(device.clone()));
        if existing_device.is_none() {
            return Err(Error::DeviceNotRegistered);
        }

        let mut device_info = existing_device.unwrap();
        device_info.owner = owner;
        device_info.rate_per_second;
        device_info.is_active = is_active;

        env.storage().instance().set(&DataKey::Device(device), &device_info);
        Ok(())
    }

    /// Update global configuration (admin only)
    pub fn update_config(env: Env, admin: Address, min_deposit: i128, max_duration: u64, fee_rate: i128) -> Result<(), Error> {
        let config: GlobalConfig = env.storage().instance().get(&DataKey::GlobalConfig).unwrap();
        config.admin.require_auth();

        let new_config = GlobalConfig {
            admin: admin.clone(),
            min_deposit,
            max_session_duration: max_duration,
            fee_rate,
        };

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::GlobalConfig, &new_config);
        Ok(())
    }
}
