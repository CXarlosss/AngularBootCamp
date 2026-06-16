# 🛡️ AuthForge

**AuthForge** is a production-ready, highly secure Identity Provider (IdP) built to centralize authentication and session management across multiple applications. Designed for high performance and extensibility, AuthForge securely powers the authentication layer for projects like [FluxForge](https://flux-forge-wine.vercel.app) and can easily be integrated into any new application.

![AuthForge Banner](https://via.placeholder.com/1200x400/0f0f1a/ffffff?text=AuthForge+Identity+Provider)

## 🌟 Key Features

- **Advanced Token Rotation:** Implements short-lived access tokens (15m) and secure refresh tokens (7d) with automatic rotation to minimize the risk of compromised credentials.
- **Two-Factor Authentication (2FA):** Built-in TOTP support utilizing `otplib` and `qrcode`, fully compatible with Google Authenticator, Authy, and other standard 2FA apps.
- **OAuth2 Integration:** Seamless social login via GitHub OAuth Client, reducing friction for new users.
- **Role-Based Access Control (RBAC):** Native middleware to protect routes based on granular user roles and permissions.
- **Real-Time Session Management:** Administrators can view active sessions and revoke access remotely.

## 🏗️ Architecture

AuthForge is built on a high-performance stack prioritizing security and execution speed:

- **Framework:** [Fastify](https://fastify.dev/) for low-overhead, high-throughput routing.
- **Language:** TypeScript for end-to-end type safety.
- **Database:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for lightning-fast, synchronous local data storage.
- **Validation:** Zod for robust request payload validation.
- **Security Primitives:** `bcrypt` for password hashing, `jsonwebtoken` for secure stateless tokens.

```mermaid
graph TD
    Client[Client App (e.g. FluxForge)] -->|POST /api/auth/login| AuthForge
    Client -->|OAuth Redirect| GitHub[GitHub OAuth]
    GitHub -->|Callback| AuthForge
    
    subgraph AuthForge API
        Router[Fastify Router]
        Zod[Zod Validation]
        RBAC[RBAC Middleware]
        Services[Auth & Session Services]
        SQLite[(SQLite Database)]
        
        Router --> Zod
        Zod --> RBAC
        RBAC --> Services
        Services <--> SQLite
    end
```

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- A GitHub OAuth Application (for social login)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/CXarlosss/authforge-api.git
   cd authforge-api
   npm install
   ```

2. Configure your environment variables. Create a `.env` file based on the following template:
   ```env
   PORT=4000
   JWT_SECRET=YourSuperSecretKeyHere
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/health` | Healthcheck endpoint | No |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve tokens | No |
| `POST` | `/api/auth/refresh` | Refresh an expired access token | Yes (Refresh Token) |
| `GET`  | `/api/auth/github/url` | Get GitHub OAuth URL | No |
| `POST` | `/api/auth/github/callback` | Exchange OAuth code for tokens | No |
| `POST` | `/api/auth/2fa/setup` | Generate 2FA secret and QR code | Yes |
| `POST` | `/api/auth/2fa/verify` | Verify and activate 2FA TOTP | Yes |

## 📸 Demo & Usage

*(Add GIFs demonstrating the login flow, 2FA setup, and session revocation here)*

![Login Flow Placeholder](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Login+Flow+GIF)

---
*Developed by [Carlos](https://super-portfolio-chi.vercel.app)*
