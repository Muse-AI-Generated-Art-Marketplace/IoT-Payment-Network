# Contributing to IoT Stellar DID Project

Thank you for your interest in contributing to the IoT Payment & Decentralized Identity project on the Stellar Network!

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please read and follow these guidelines in all interactions.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- Rust 1.70.0 or higher (for smart contracts)
- Docker (for local testing)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/iot-stellar-did.git
   cd iot-stellar-did
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-org/iot-stellar-did.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up development environment:
   ```bash
   # Install Rust targets for contracts
   rustup target add wasm32-unknown-unknown
   
   # Install Soroban CLI
   cargo install soroban-cli
   
   # Set up environment files
   cp api/.env.example api/.env.local
   cp web/.env.local.example web/.env.local
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Changes

- Follow the coding standards outlined below
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm run test

# Run contract tests
cd contracts && make test

# Run API tests
cd api && npm run test

# Run web tests
cd web && npm run test
```

### 4. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Feature
git commit -m "feat: add device registration API endpoint"

# Bug fix
git commit -m "fix: resolve session calculation overflow issue"

# Documentation
git commit -m "docs: update API documentation"

# Breaking change
git commit -m "feat!: change contract storage structure"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request against the main branch.

## Project Structure

```
├── contracts/          # Soroban smart contracts
│   ├── src/           # Contract source code
│   ├── tests/         # Contract tests
│   └── Makefile       # Build and deployment scripts
├── identity/           # DID module
│   ├── src/           # TypeScript source
│   ├── tests/         # Unit tests
│   └── package.json   # Package configuration
├── api/               # Backend API
│   ├── src/           # Node.js source
│   ├── tests/         # API tests
│   └── package.json   # Package configuration
├── web/               # Frontend dashboard
│   ├── src/           # Next.js source
│   ├── tests/         # Frontend tests
│   └── package.json   # Package configuration
└── README.md          # Project documentation
```

## Coding Standards

### General Guidelines

- Use descriptive variable and function names
- Keep functions small and focused
- Write self-documenting code
- Follow language-specific conventions

### Rust (Smart Contracts)

- Use `rustfmt` for formatting
- Follow Rust naming conventions
- Include comprehensive documentation
- Handle errors gracefully
- Use `Result` types for fallible operations

```rust
// Good
pub fn start_session(
    env: Env,
    user: Address,
    device: Address,
    duration: u64,
    deposit: i128,
) -> Result<BytesN<32>, Error> {
    // Implementation
}

// Bad
pub fn start(env: Env, u: Address, d: Address, t: u64, a: i128) -> BytesN<32> {
    // Implementation
}
```

### TypeScript (API & Web)

- Use TypeScript strictly
- Use functional components with React
- Follow ESLint configuration
- Use proper error handling
- Include JSDoc comments for complex functions

```typescript
// Good
interface Session {
  id: string;
  device: string;
  user: string;
  startTime: Date;
  endTime: Date;
  deposit: number;
  isActive: boolean;
}

// Bad
interface Session {
  id: any;
  device: any;
  user: any;
  start: any;
  end: any;
  amount: any;
  active: any;
}
```

## Testing

### Smart Contracts

- Write unit tests for all public functions
- Test edge cases and error conditions
- Use Soroban testutils
- Maintain test coverage above 80%

```rust
#[test]
fn test_start_session_success() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IoTPaymentContract);
    let client = IoTPaymentContractClient::new(&env, &contract_id);
    
    // Test implementation
}
```

### API Tests

- Use Jest for unit tests
- Use Supertest for integration tests
- Mock external dependencies
- Test all endpoints and error cases

### Frontend Tests

- Use React Testing Library
- Test component behavior, not implementation
- Use Storybook for component documentation
- Maintain visual regression tests

## Documentation

### Code Documentation

- Document all public APIs
- Include examples in documentation
- Use consistent formatting
- Keep documentation up to date

### README Files

Each module should have a comprehensive README.md including:
- Purpose and functionality
- Installation instructions
- Usage examples
- API reference
- Contributing guidelines

### API Documentation

- Use OpenAPI/Swagger for API documentation
- Include request/response examples
- Document error responses
- Keep documentation in sync with code

## Submitting Changes

### Pull Request Requirements

1. **Clear Description**: Explain what your changes do and why
2. **Testing**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Linting**: Pass all linting checks
5. **Breaking Changes**: Clearly mark any breaking changes

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Review Process

### Code Review

- All pull requests require at least one review
- Reviews focus on code quality, functionality, and documentation
- Address all review comments before merging

### Merge Process

- Maintain a clean commit history
- Use squash merge for small changes
- Use rebase merge for feature branches
- Update version numbers as needed

## Getting Help

- Create an issue for bugs or feature requests
- Join our Discord community for discussions
- Check existing documentation before asking questions
- Be patient and respectful in all interactions

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Community announcements

Thank you for contributing to the IoT Stellar DID project! 🚀
