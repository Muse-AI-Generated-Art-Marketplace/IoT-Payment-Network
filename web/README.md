# IoT Stellar Web Dashboard

A modern Next.js dashboard for managing IoT devices, payments, and decentralized identities on the Stellar Network.

## Features

### Dashboard Overview
- Real-time account balance monitoring
- Device usage statistics
- Session activity tracking
- Payment history visualization

### Device Management
- Register new IoT devices
- Monitor device status
- Update device configurations
- View device credentials

### Session Management
- Start and end payment sessions
- Monitor active sessions
- View session history
- Real-time cost tracking

### Identity Management
- Create and manage DIDs
- Issue and verify credentials
- Identity verification
- DID resolution

### Account Management
- Fund accounts with XLM
- Transaction history
- Balance monitoring
- Network switching

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- A Stellar account (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/iot-stellar-did.git
cd iot-stellar-did/web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SENTRY=false
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/             # UI components
│   ├── dashboard.tsx   # Main dashboard
│   ├── device-manager.tsx
│   ├── session-manager.tsx
│   └── identity-manager.tsx
├── lib/                # Utility functions
│   ├── utils.ts        # Common utilities
│   └── stellar.ts      # Stellar SDK helpers
├── hooks/              # Custom React hooks
├── store/              # State management
└── types/              # TypeScript definitions
```

## Key Components

### Dashboard
The main dashboard provides an overview of all system components with real-time updates.

### Device Manager
Manage IoT devices, including registration, configuration, and monitoring.

### Session Manager
Handle payment sessions with real-time cost tracking and session history.

### Identity Manager
Create and manage decentralized identities for IoT devices.

### Account Balance
Monitor Stellar account balance and transaction history.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run storybook` - Start Storybook

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing
- **Storybook** for component documentation

### Styling

The project uses:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Framer Motion** for animations

## Integration

### Backend API

The dashboard connects to the backend API at `NEXT_PUBLIC_API_URL`. Make sure the API server is running before starting the dashboard.

### Stellar Network

The dashboard supports both testnet and public networks. Configure the network using the `NEXT_PUBLIC_STELLAR_NETWORK` environment variable.

### WebSocket

Real-time updates are handled through WebSocket connections. Configure the WebSocket URL using `NEXT_PUBLIC_WS_URL`.

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup

Ensure all environment variables are properly configured for your deployment environment.

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload the `out` directory to Netlify
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) file for details.
