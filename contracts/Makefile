# Makefile for Soroban IoT Payment Contracts

.PHONY: build test deploy clean check

# Default network
NETWORK ?= testnet

# Stellar configuration
STELLAR_NETWORK ?= testnet
HORIZON_URL ?= https://horizon-testnet.stellar.org
SOROBAN_RPC_URL ?= https://soroban-testnet.stellar.org

# Contract configuration
CONTRACT_ID ?=
SECRET_KEY ?=

# Build the contract
build:
	cargo build --target wasm32-unknown-unknown --release
	cp target/wasm32-unknown-unknown/release/iot_stellar_contracts.wasm ./

# Run tests
test:
	cargo test

# Check code formatting and linting
check:
	cargo fmt --check
	cargo clippy -- -D warnings

# Deploy contract to testnet
deploy: build
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "Deploying new contract..."; \
		soroban contract deploy --wasm iot_stellar_contracts.wasm --network $(STELLAR_NETWORK) --source $(SECRET_KEY); \
	else \
		echo "Updating existing contract $(CONTRACT_ID)..."; \
		soroban contract install --wasm iot_stellar_contracts.wasm --id $(CONTRACT_ID) --network $(STELLAR_NETWORK) --source $(SECRET_KEY); \
	fi

# Initialize contract (run after deploy)
initialize:
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "Error: CONTRACT_ID is required"; \
		exit 1; \
	fi
	soroban contract invoke \
		--id $(CONTRACT_ID) \
		--network $(STELLAR_NETWORK) \
		--source $(SECRET_KEY) \
		-- \
		initialize \
		--admin $(ADMIN_ADDRESS) \
		--min_deposit 1000 \
		--max_duration 86400 \
		--fee_rate 100

# Register a test device
register_device:
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "Error: CONTRACT_ID is required"; \
		exit 1; \
	fi
	soroban contract invoke \
		--id $(CONTRACT_ID) \
		--network $(STELLAR_NETWORK) \
		--source $(SECRET_KEY) \
		-- \
		register_device \
		--device $(DEVICE_ADDRESS) \
		--owner $(OWNER_ADDRESS) \
		--rate_per_second 100

# Get contract information
info:
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "Error: CONTRACT_ID is required"; \
		exit 1; \
	fi
	soroban contract read \
		--id $(CONTRACT_ID) \
		--network $(STELLAR_NETWORK) \
		-- \
		get_config

# Clean build artifacts
clean:
	rm -f iot_stellar_contracts.wasm
	cargo clean

# Format code
fmt:
	cargo fmt

# Run clippy
clippy:
	cargo clippy

# Generate documentation
docs:
	cargo doc --open

# Development setup
setup:
	rustup target add wasm32-unknown-unknown
	cargo install soroban-cli

# Local testing with stellar quickstart
test_local:
	docker run --rm -it -p 8000:8000 stellar/quickstart:latest --testnet --enable-soroban-rpc

# Full deployment workflow
deploy_full: build deploy initialize

# Help
help:
	@echo "Available targets:"
	@echo "  build           - Build the contract"
	@echo "  test            - Run tests"
	@echo "  deploy          - Deploy contract to network"
	@echo "  initialize      - Initialize deployed contract"
	@echo "  register_device - Register a test device"
	@echo "  info            - Get contract information"
	@echo "  clean           - Clean build artifacts"
	@echo "  fmt             - Format code"
	@echo "  clippy          - Run clippy"
	@echo "  docs            - Generate documentation"
	@echo "  setup           - Install required tools"
	@echo "  test_local      - Start local Stellar testnet"
	@echo "  deploy_full     - Full deployment workflow"
	@echo ""
	@echo "Environment variables:"
	@echo "  NETWORK         - Stellar network (default: testnet)"
	@echo "  CONTRACT_ID     - Contract ID for updates"
	@echo "  SECRET_KEY      - Account secret key"
	@echo "  ADMIN_ADDRESS   - Admin address for initialization"
	@echo "  DEVICE_ADDRESS  - Device address for registration"
	@echo "  OWNER_ADDRESS   - Owner address for device registration"
