# 🎟️ Scantyx — No Scams, Just Scans

Scantyx is a next-generation event ticketing platform built during HackIndia Spaark 7 (2025) that combines the security of blockchain with the scalability of cloud computing. Our hybrid architecture ensures fast, reliable ticket validation while maintaining the benefits of decentralized technology.

## 🏗️ Hybrid Architecture

Scantyx uses a smart hybrid approach:

- **Blockchain Layer** (Security & Trust)
  - 🔐 Immutable ticket ownership records
  - ✅ Tamper-proof ticket validation
  - 🛡️ Anti-fraud protection

- **Cloud Layer** (Performance & Scale)
  - ⚡ Blazing fast event discovery
  - 📈 Handles millions of concurrent users
  - 🌍 Global content delivery

## 🚀 Key Features

- 🎟️ **Secure Ticketing**
  - Blockchain-verified ticket ownership
  - Fraud-proof ticket validation
  - Instant transfer and resale

- ⚡ **Lightning Fast**
  - Cloud-based event discovery
  - Real-time availability updates
  - Smooth checkout experience

- 📱 **User-Friendly**
  - Simple wallet connection
  - Mobile-optimized interface
  - Email and push notifications

- 📊 **Advanced Analytics**
  - Real-time event insights
  - Attendance tracking
  - Revenue reporting

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vite + React + TypeScript
- **UI/UX**: Tailwind CSS, Framer Motion
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API design
- **Security**: Helmet, CORS, rate limiting, data sanitization
- **Validation**: Joi, express-validator
- **File Uploads**: Multer with Sharp for image processing
- **Email**: Nodemailer with Mailtrap (dev) and SendGrid (prod)
- **Testing**: Jest, Supertest
- **Documentation**: Postman Collection (included)

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or later
- MongoDB (local or Atlas)
- Git
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scantyx.git
   cd scantyx
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Start the development server**
   ```bash
   # Start backend server
   npm run server
   
   # Start frontend development server
   npm run dev
   
   # Or run both concurrently
   npm run dev:fullstack
   ```

## 📦 Project Structure

```
scantyx/
├── client/                  # Frontend React application
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── validators/         # Request validation schemas
├── tests/                  # Test files
├── .env                    # Environment variables
├── .eslintrc.js            # ESLint config
├── .gitignore
├── package.json
└── server.js               # Entry point
```

## 🔒 Authentication

Scantyx uses JWT (JSON Web Tokens) for authentication. The token is sent in an HTTP-only cookie for security.

### Protected Routes

To access protected routes, include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### User Roles

- `user`: Regular user (default)
- `organizer`: Event organizer
- `admin`: System administrator

## 📚 API Documentation

For detailed API documentation, please refer to the [API Documentation](API_DOCS.md) or import the Postman collection from `/docs/Scantyx-API.postman_collection.json`.

## 🧪 Testing

Run tests using:

```bash
npm test
```

## 🚀 Deployment

### Prerequisites
- MongoDB Atlas account
- Node.js production server (or PaaS like Heroku/Railway)
- Domain name (optional but recommended)

### Steps

1. **Set up production environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_secure_jwt_secret
   # ... other production variables
   ```

2. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ during HackIndia Spaark 7 (2025)
- Special thanks to our mentors and the open-source community
- **API**: Node.js + Express
- **Database**: MongoDB (Scalable NoSQL)
- **Caching**: Redis (For high-speed data access)

### Blockchain
- **Smart Contracts**: Solidity
- **Web3 Library**: Ethers.js
- **Network**: Ethereum-compatible chains

### Infrastructure
- **Hosting**: AWS/GCP
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, LogRocket

---

## 🏗️ Project Structure

```
.
# Core Application
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Shared components
│   │   ├── events/         # Event-related components
│   │   ├── wallet/         # Web3 wallet integration
│   │   └── ui/             # Base UI components
│   │
│   ├── contexts/           # Global state management
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── Web3Context.jsx # Blockchain interactions
│   │   └── EventsContext.jsx # Events state
│   │
│   ├── pages/              # Application routes
│   │   ├── user/           # User dashboard
│   │   ├── admin/          # Admin interface
│   │   └── public/         # Public pages
│   │
│   ├── contracts/          # Smart contracts
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
│
# Configuration
├── .env.example           # Environment variables
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind config
└── vite.config.ts         # Vite configuration
```

## 🚀 Getting Started

1. **Prerequisites**
   - Node.js v16+
   - npm or yarn
   - MetaMask browser extension

2. **Installation**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
