use soroban_sdk::symbol_short;
use soroban_sdk::{Address, BytesN, Env, Vec};
use crate::{IoTPaymentContract, DataKey, DeviceInfo, Session, GlobalConfig, Error};

// Generate client for testing
soroban_sdk::contractclient!(IoTPaymentContractClient);

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    
    let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    assert_eq!(stored_admin, admin);
}

#[test]
fn test_register_device() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let device = Address::generate(&env);
    let owner = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    client.register_device(&device, &owner, &100i128, &Vec::new(&env));

    let device_info: DeviceInfo = client.get_device(&device).unwrap();
    assert_eq!(device_info.owner, owner);
    assert_eq!(device_info.rate_per_second, 100i128);
    assert!(device_info.is_active);
}

#[test]
fn test_start_session() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let device = Address::generate(&env);
    let user = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    client.register_device(&device, &user, &100i128, &Vec::new(&env));

    let session_id = client.start_session(&user, &device, &3600u64, &5000i128);
    assert!(session_id.is_ok());

    let session: Session = client.get_session(&session_id.unwrap()).unwrap();
    assert_eq!(session.user, user);
    assert_eq!(session.device, device);
    assert!(session.is_active);
}

#[test]
fn test_end_session() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let device = Address::generate(&env);
    let user = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    client.register_device(&device, &user, &100i128, &Vec::new(&env));

    let session_id = client.start_session(&user, &device, &3600u64, &5000i128).unwrap();
    
    // Simulate time passing
    env.ledger().set_timestamp(env.ledger().timestamp() + 1800u64);
    
    let ended_session = client.end_session(&session_id, &user);
    assert!(ended_session.is_ok());

    let session: Session = client.get_session(&session_id).unwrap();
    assert!(!session.is_active);
    assert!(session.total_cost > 0);
}

#[test]
fn test_insufficient_deposit() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let device = Address::generate(&env);
    let user = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    client.register_device(&device, &user, &100i128, &Vec::new(&env));

    let result = client.start_session(&user, &device, &3600u64, &500i128); // Below minimum deposit
    assert_eq!(result.unwrap_err(), Error::InsufficientDeposit);
}

#[test]
fn test_unauthorized_session_end() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let device = Address::generate(&env);
    let user = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);
    
    client.initialize(&admin, &1000i128, &3600u64, &100i128);
    client.register_device(&device, &user, &100i128, &Vec::new(&env));

    let session_id = client.start_session(&user, &device, &3600u64, &5000i128).unwrap();
    
    let result = client.end_session(&session_id, &unauthorized_user);
    assert_eq!(result.unwrap_err(), Error::Unauthorized);
}
