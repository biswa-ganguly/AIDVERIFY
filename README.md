# AidVerify

**AI-Powered Transparent Aid Distribution Platform**

AidVerify is a comprehensive blockchain-based platform that ensures transparent and fraud-free aid distribution using AI-powered face recognition technology. The platform connects donors, NGOs, and field workers to create a trustworthy ecosystem for humanitarian aid.

## 🌟 Features

### Core Functionality
- **AI-Powered Face Recognition**: Real-time beneficiary verification using advanced face recognition
- **Blockchain Transparency**: Immutable donation tracking and campaign management
- **Multi-Role Dashboard**: Separate interfaces for donors, NGOs, admins, and field workers
- **Real-Time Distribution**: Live aid distribution tracking with fraud prevention
- **OCR Document Processing**: Automated document verification for NGO applications
- **Immutable Ledger**: Record all donations and spending in an immutable blockchain ledger
- **Live Dashboard**: Real-time tracking so donors can see exactly how their money is being used
- **Smart Contract Milestones**: Automated fund release only when specific project milestones are met
- **Blockchain Audit Reports**: Independently verifiable audit reports backed by blockchain technology
- **Token Reward System**: Incentivize continued donations through token-based rewards
- **Crowdfunding Integration**: Support for specific, small-scale project funding

### Key Components
- **Smart Contract Integration**: Ethereum-based campaign and donation management
- **Cloud Storage**: Secure image and document storage via Cloudinary
- **Authentication**: Clerk-based user authentication and role management
- **Responsive UI**: Modern React-based interface with Tailwind CSS

## 🏗️ Architecture

```
AidVerify/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express API server
├── face_verify/       # Python FastAPI face recognition service
└── blockchain/        # Solidity smart contracts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- Ethereum wallet (MetaMask)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AIDVERIFY
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

4. **Face Recognition Service**
```bash
cd face_verify
pip install -r requirements.txt
python -m app.main
```

5. **Blockchain Setup**
```bash
cd blockchain
npm install -g truffle
truffle compile
truffle migrate --network development
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ETHEREUM_RPC_URL=your_ethereum_rpc_url
PRIVATE_KEY=your_ethereum_private_key
```

**Frontend (.env)**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:3000
VITE_FACE_VERIFY_URL=http://localhost:8000
```

## 📱 User Roles & Features

### 🏢 Admin Dashboard
- Campaign approval and management
- NGO verification and onboarding
- User role management
- System analytics and monitoring
- Fraud detection and reporting

### 🤝 NGO Dashboard
- Campaign creation and management
- Fund utilization tracking
- Field worker management
- Beneficiary registration
- Impact reporting

### 💝 Donor Dashboard
- Browse and donate to campaigns
- Track donation impact
- View transparency reports
- Download donation receipts
- Campaign discovery and filtering

### 👥 Field Worker Interface
- Real-time face recognition verification
- Aid distribution tracking
- Fraud reporting
- Beneficiary management
- Offline capability support

## 🔐 Security Features

- **Face Recognition**: InsightFace-powered biometric verification
- **Blockchain Security**: Immutable transaction records
- **Role-Based Access**: Secure authentication with Clerk
- **Data Encryption**: End-to-end encrypted sensitive data
- **Fraud Detection**: AI-powered duplicate detection
- **Audit Trail**: Complete transaction history

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Lucide React** - Icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Clerk** - Authentication
- **Cloudinary** - Media management
- **Tesseract.js** - OCR processing

### AI/ML Services
- **FastAPI** - Python web framework
- **InsightFace** - Face recognition
- **OpenCV** - Computer vision
- **ONNX Runtime** - ML inference

### Blockchain
- **Solidity** - Smart contract language
- **Truffle** - Development framework
- **Ethers.js** - Ethereum interaction
- **Web3** - Blockchain connectivity

## 📊 API Documentation

### Face Recognition API
```
POST /api/add_user          # Add new beneficiary
POST /api/verify_user       # Verify beneficiary identity
GET  /api/all_user          # Get all users for event
POST /api/create_event      # Create new distribution event
```

### Backend API
```
POST /api/campaigns         # Create campaign
GET  /api/campaigns         # Get all campaigns
POST /api/donations         # Process donation
GET  /api/ngo-applications  # NGO applications
POST /api/fund-utilization  # Track fund usage
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test

# Smart contract tests
cd blockchain
truffle test
```

## 📈 Deployment

### Production Deployment
1. Configure production environment variables
2. Build frontend: `npm run build`
3. Deploy smart contracts to mainnet
4. Set up cloud infrastructure (AWS/GCP)
5. Configure CI/CD pipeline

### Docker Support
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🙏 Acknowledgments

- InsightFace for face recognition technology
- Clerk for authentication services
- Cloudinary for media management
- The open-source community

---

**Built with ❤️ for transparent humanitarian aid distribution**