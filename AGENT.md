# Agent Development Rules for Inflight Tracker

## Project Overview
This is a Next.js flight tracking application that has been converted to a Tauri desktop app with a Rust backend. The app tracks real-time flight data from multiple airline APIs (American Airlines Intelsat/ViaSat, JetBlue) and displays it in a React frontend.

## Functionalities
- When connect to in flight wifi (detected the vendor that has the data)
    - Show the flight data
    - Enhance the data fetching experience and accuracy by using both OpenADSB data + in flight wifi data
        - This requires the inflight Wifi able to access the network
- If only connect to Wifi that can access network (which user might not be in flight)
    - User can type in a flight number or random track a flight's data through OpenADSB

## Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, BuouUI
- **Backend**: Rust with Tauri 2.6.2
- **Package Manager**: pnpm
- **Data Sources**: American Airlines APIs, JetBlue API, OpenADSB
- **Maps**: MapBox/MapLibre GL
- **Charts**: Recharts

## Development Commands

### Rules

Additional information agent can reference to can check on `rules` folder

### Primary Commands
- `pnpm tauri:dev` - Start development server with hot reload (Next.js + Rust)
- `pnpm tauri:build` - Build production app bundle for macOS
- `pnpm build` - Build Next.js static export only
- `pnpm dev` - Start Next.js development server only

### Testing & Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `cargo test --manifest-path src-tauri/Cargo.toml` - Run Rust tests

## Development Workflow Rules

### 🚨 IMPORTANT: Command Execution Rules
1. **NEVER run `pnpm tauri:dev` automatically**
2. **ALWAYS ask the user to run `pnpm tauri:dev` manually**
3. **ALWAYS ask for feedback after suggesting they run the command**
4. **Wait for user's output/feedback before proceeding**

### Example Interaction Pattern:
```
✅ Good:
"I've made the changes to fix the compilation errors. Please run `pnpm tauri:dev` and let me know what happens."

❌ Bad: 
Running `pnpm tauri:dev` automatically without asking
```

### Code Quality Standards
- Use TypeScript strict mode
- Follow existing code style and patterns
- Maintain backward compatibility with React components
- Use snake_case in Rust, camelCase in TypeScript
- Add proper error handling in both Rust and TypeScript

### Architecture Guidelines
- **Rust Backend**: Handle all external API calls, data processing, and merging
- **TypeScript Frontend**: UI components, state management, user interactions
- **Data Flow**: Frontend → Tauri Commands → Rust Services → External APIs
- **Error Handling**: Graceful degradation, user-friendly error messages

## Project Structure

### Frontend (`/`)
- `app/` - Next.js App Router pages and layouts
- `components/` - React UI components
- `lib/` - Utility functions and Tauri API wrappers
- `types/` - TypeScript type definitions
- `config/` - App configuration

### Backend (`src-tauri/`)
- `src/models/` - Rust data structures and conversion traits
- `src/services/` - API clients and business logic
- `src/commands/` - Tauri command handlers
- `Cargo.toml` - Rust dependencies

## Common Issues & Solutions

### Compilation Issues
- Check Rust feature flags in `Cargo.toml`
- Ensure type consistency between Rust and TypeScript
- Verify macro usage for data merging

### Runtime Issues
- Validate vendor endpoints are accessible
- Check CORS policies for external APIs
- Ensure proper error propagation from Rust to frontend

### Development Issues
- Port conflicts: Next.js may use different port if 3000 is busy
- Hot reload: Changes to Rust code require restart
- TypeScript: Check type conversions between snake_case/camelCase

## Notes
- The app works offline with cached data via localStorage
- Supports multiple flight data vendors with priority-based merging
- Includes smart vendor detection and fallback mechanisms
- Maps are conditionally rendered based on internet connectivity
