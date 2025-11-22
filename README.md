# PredictionAI - Agricultural Yield Prediction System

## 📋 Quick Overview

**PredictionAI** is a full-stack web application designed to predict agricultural yields using machine learning. It provides farmers and agricultural professionals with data-driven insights by analyzing crop performance data and environmental factors. The system features user authentication, CSV data uploads, predictive analytics, and comprehensive result comparisons.

---

## 🏗️ Architecture Overview

PredictionAI follows a **modern full-stack microservices architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                  │
│              React 19 + TypeScript + Tailwind CSS           │
├─────────────────────────────────────────────────────────────┤
│  Pages: Auth, Dashboard, Predictions, Comparisons, History  │
│  State: AuthContext, PredictionCsvContext                   │
│  UI: Components, Charts, Forms, Tables                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API (Axios)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Backend)                      │
│          Flask + Flask-RESTX + MongoDB + JWT Auth          │
├─────────────────────────────────────────────────────────────┤
│  Namespaces: /users, /predict, /email                       │
│  Endpoints: Auth, CSV Upload, Predictions, History          │
│  Middleware: CORS, JWT, Email Verification                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│         MongoDB (NoSQL) + ML Pipeline                       │
├─────────────────────────────────────────────────────────────┤
│  Collections: users, courses, History                       │
│  ML Models: TensorFlow/Keras, Scikit-learn                  │
│  Feature Engineering: Data preprocessing, metrics calc      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 What This Project Does

1. **User Authentication** - Secure sign-up/sign-in with email verification and JWT tokens
2. **Agricultural Yield Prediction** - Machine learning model that predicts crop yields based on environmental and crop data
3. **Batch Processing** - CSV file uploads for predicting yields across multiple records
4. **Data Analysis** - Metrics calculation (MAE, MSE, R², etc.) and performance visualization
5. **History Tracking** - Complete audit trail of predictions and user actions
6. **Role-Based Access** - Admin dashboard with user management capabilities

---

## 📁 Project Structure

```
PredictionAI/
│
├── flask-mongo/                    # Backend (Flask API)
│   ├── app.py                      # Flask entry point
│   ├── config.py                   # Configuration (DB, mail, JWT)
│   ├── requirements.txt            # Python dependencies
│   ├── mongodb_files/              # Sample data (courses, users JSON)
│   │
│   └── application/                # Main Flask application package
│       ├── __init__.py             # Flask app initialization, CORS setup
│       ├── models.py               # MongoEngine data models
│       │                           # - users, courses, History, CSVFileContent
│       │
│       ├── routes/                 # API endpoints
│       │   ├── __init__.py         # Register all namespaces
│       │   ├── auth.py             # User auth, registration, password reset
│       │   ├── prediction.py       # ML prediction endpoints
│       │   ├── mail.py             # Email sending functionality
│       │   └── users.py            # User management endpoints
│       │
│       ├── ml/                     # Machine Learning module
│       │   ├── predictor.py        # ML model loading and inference
│       │   ├── analyse.py          # Data validation and metrics calculation
│       │   └── feature_engineering.py  # Data preprocessing
│       │
│       └── utils/                  # Utility functions
│           └── history.py          # Action logging to database
│
├── frontEnd/                       # Frontend (React + TypeScript)
│   ├── package.json                # Node.js dependencies
│   ├── vite.config.ts              # Vite bundler configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── index.html                  # HTML entry point
│   │
│   └── src/
│       ├── App.tsx                 # Main routing and layout
│       ├── main.tsx                # React entry point
│       ├── index.css               # Global styles
│       │
│       ├── context/                # React Context (State Management)
│       │   ├── AuthContext         # Authentication state
│       │   └── PredictionCsvContext # CSV and prediction state
│       │
│       ├── components/             # Reusable React components
│       │   ├── auth/               # Auth components (routes, forms)
│       │   ├── common/             # Shared components (nav, breadcrumb)
│       │   ├── form/               # Form components (input, select)
│       │   ├── ecommerce/          # Dashboard components (charts, cards)
│       │   └── UserProfile/        # User profile components
│       │
│       ├── pages/                  # Page components (route-level)
│       │   ├── AuthPages/          # SignIn, SignUp, Password reset
│       │   ├── prediction/         # PredictionPage, Comparisons, History
│       │   ├── Dashboard/          # Home (user), HomeAdmin
│       │   ├── Tables/             # Data tables
│       │   ├── Forms/              # Form pages
│       │   ├── Charts/             # Chart visualizations
│       │   ├── UiElements/         # UI component showcase
│       │   ├── users/              # Admin user management
│       │   └── OtherPage/          # 404 Not Found
│       │
│       ├── layout/                 # Layout wrapper
│       │   └── AppLayout           # Main app layout with sidebar
│       │
│       ├── public/                 # Static assets (favicon, logo)
│       └── styles/                 # Additional styling
│
└── .gitignore                      # Git ignore rules
```

---

## 🔧 Tech Stack & Dependencies

### Backend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **Flask** | Web framework | 3.1.3 |
| **Flask-RESTX** | REST API framework | Latest |
| **MongoDB/MongoEngine** | NoSQL database & ODM | Latest |
| **Flask-JWT-Extended** | JWT authentication | Latest |
| **Flask-Mail** | Email sending | Latest |
| **TensorFlow** | Deep learning framework | 2.18.0 |
| **Scikit-learn** | ML algorithms & metrics | 1.7.1 |
| **Pandas** | Data manipulation | 2.2.3 |
| **NumPy** | Numerical computing | 2.0.2 |

### Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 19.0.0 |
| **TypeScript** | Type safety | ~5.7.2 |
| **React Router** | Client-side routing | 7.8.1 |
| **Tailwind CSS** | Styling utility framework | 4.0.8 |
| **Vite** | Build tool & dev server | 6.1.0 |
| **Axios** | HTTP client | 1.11.0 |
| **ApexCharts** | Data visualization | 4.1.0 |
| **React Hot Toast** | Notifications | 2.6.0 |
| **FullCalendar** | Calendar component | 6.1.15 |

---

## 🚀 Core Components & Features

### 1. **Authentication System**
- **Location**: `backend/application/routes/auth.py`, `frontend/pages/AuthPages/`
- **Features**:
  - User registration with email verification
  - JWT-based authentication
  - Password reset via secure tokens
  - Role-based access control (user/admin)
- **Flow**: User signs up → Verification email sent → Email verified → Access granted

### 2. **Prediction Engine**
- **Location**: `backend/application/ml/`, `frontend/pages/prediction/`
- **Features**:
  - Single prediction: Submit form with crop/weather parameters
  - Batch prediction: Upload CSV with multiple records
  - Real-time inference using trained TensorFlow model
  - Metric calculations (MAE, MSE, R², etc.)
- **Input Features** (19 parameters):
  - Week, Days after planting, Maturation speed, Variety
  - Temperature (min/avg/max), Humidity (min/avg/max)
  - Solar radiation, VPD (vapor pressure deficit)
  - Heat degree, Heat index, Dew point, Evapotranspiration

### 3. **Data Processing & Analysis**
- **Location**: `backend/application/ml/analyse.py`
- **Functions**:
  - Data validation and cleaning
  - Automatic column detection (week, actual, prediction)
  - Statistical metric calculation
  - Outlier handling
  - Data normalization

### 4. **User Management**
- **Location**: `backend/application/routes/users.py`
- **Endpoints**:
  - GET/POST /users - List and create users
  - GET/PUT/DELETE /users/{id} - Manage individual users
  - PUT /users/{id}/updatepassword - Change password
  - GET /users/profile - Get current user profile

### 5. **Email System**
- **Location**: `backend/application/routes/mail.py`
- **Features**:
  - SMTP integration (Gmail)
  - HTML email templates
  - Verification tokens
  - Password reset emails

### 6. **History & Audit Trail**
- **Location**: `backend/application/models.py` (History model)
- **Tracks**:
  - Prediction operations
  - CSV uploads
  - User actions
  - File metadata
  - Results and metrics

### 7. **Admin Dashboard**
- **Location**: `frontend/pages/Dashboard/HomeAdmin`
- **Features**:
  - User statistics
  - Activity monitoring
  - Prediction analytics
  - System-wide metrics

---

## 📊 Execution Flow - Typical Request Lifecycle

### **Scenario 1: User Registration & Login**

```
1. User fills SignUp form (name, email, password)
   ↓
2. Frontend validates input → POST /users
   ↓
3. Backend receives payload:
   - Check if email already exists
   - Hash password using pbkdf2:sha512
   - Create user document in MongoDB
   - Generate verification token
   ↓
4. Send verification email via SMTP
   ↓
5. User clicks verification link → Token validated
   ↓
6. User logs in with email/password → POST /users/login
   ↓
7. Backend validates credentials, generates JWT token
   ↓
8. Frontend stores token in localStorage
   ↓
9. All subsequent requests include Authorization header with JWT
```

### **Scenario 2: Single Prediction**

```
1. User navigates to /form-predict
   ↓
2. Fills form with 19 crop/weather parameters
   ↓
3. Clicks "Predict" → POST /predict
   ↓
4. Backend:
   - Validates all required fields
   - Loads TensorFlow model
   - Normalizes/scales input features
   - Runs inference
   - Returns predicted yield
   ↓
5. Frontend displays prediction result with confidence metrics
```

### **Scenario 3: Batch CSV Prediction**

```
1. User uploads CSV file on /form-predict
   ↓
2. Frontend sends multipart request: POST /predict/csv
   ↓
3. Backend:
   - Validates file format (CSV)
   - Reads CSV into pandas DataFrame
   - Validates all columns present
   - Calls predict_batch() for each row
   - Calculates statistics (mean, min, max, std)
   ↓
4. Backend returns:
   - Total rows processed
   - Array of predictions with input data
   - Aggregated statistics
   ↓
5. Frontend displays results in table with charts
   ↓
6. User can download predictions as CSV
   ↓
7. Action logged to History collection
```

### **Scenario 4: View Prediction History**

```
1. User navigates to /history/all
   ↓
2. Frontend: GET /history (filtered by user_id from JWT)
   ↓
3. Backend:
   - Query History collection
   - Filter by user_id
   - Sort by created_at (newest first)
   ↓
4. Return list of all user actions with:
   - Timestamp
   - Action type (prediction, csv_upload, etc.)
   - Associated files
   - Results and metrics
   ↓
5. Frontend displays timeline/table of history
```

---

## 🔌 API Endpoints Reference

### **Authentication (`/users`)**
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/users` | Register new user | ❌ |
| GET | `/users` | Get all users | ✅ JWT |
| GET | `/users/{id}` | Get specific user | ✅ JWT |
| PUT | `/users/{id}` | Update user profile | ✅ JWT |
| DELETE | `/users/{id}` | Delete user account | ✅ JWT |
| POST | `/users/login` | Login (get JWT) | ❌ |
| POST | `/users/{id}/updatepassword` | Change password | ✅ JWT |
| POST | `/users/forgot-password` | Request password reset | ❌ |

### **Predictions (`/predict`)**
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/predict` | Single prediction | ❌ |
| POST | `/predict/csv` | Batch prediction from CSV | ❌ |
| POST | `/predict/csv/download` | CSV upload + download results | ✅ JWT (optional) |
| GET | `/predict/csv/template` | Get CSV template | ❌ |

### **Email (`/email`)**
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/email/send-verification` | Resend verification email | ❌ |
| POST | `/email/forgot-password` | Send password reset email | ❌ |

---

## 🗄️ Database Schema (MongoDB)

### **users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  firstname: String,
  lastname: String,
  phone: String,
  bio: String,
  verified: Boolean,
  role: String ("user" | "admin"),
  created_at: DateTime
}
```

### **History Collection**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  action_type: String ("prediction_csv", "compare_csv", etc),
  description: String,
  files: [
    {
      filename: String,
      content: Array of objects (CSV rows)
    }
  ],
  results: {
    // Prediction results and metrics
  },
  created_at: DateTime
}
```

### **courses Collection**
```javascript
{
  _id: ObjectId,
  courseID: String (unique),
  title: String,
  description: String,
  credits: Integer,
  term: String,
  created_at: DateTime
}
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- MongoDB (running locally on port 27017)
- Git

### **Backend Setup**

```bash
# Navigate to backend directory
cd flask-mongo

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .flaskenv file for environment variables
echo "FLASK_APP=app.py" > .flaskenv
echo "FLASK_ENV=development" >> .flaskenv

# Start Flask server (runs on http://localhost:8000)
python app.py
```

### **Frontend Setup**

```bash
# Navigate to frontend directory
cd frontEnd

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **MongoDB Setup**

```bash
# MongoDB should be running on localhost:27017
# Import sample data (optional)
mongoimport --db FlaskApp_DB --collection users --file ../mongodb_files/users.json
mongoimport --db FlaskApp_DB --collection courses --file ../mongodb_files/courses.json
```

---

## 📈 Key Features Walkthrough

### **1. Dashboard**
- **User Dashboard** (`/` or `/dashboard`)
  - Overview of user's prediction activity
  - Quick stats on predictions made
  - Recent history
  
- **Admin Dashboard** (`/admin`)
  - System-wide statistics
  - All user activity
  - User management access

### **2. Prediction Workflows**

**Form-Based Prediction**
- Navigate to `/form-predict`
- Fill 19 required parameters
- Get instant prediction with confidence interval
- Save to history

**CSV-Based Prediction**
- Navigate to `/form-predict` with CSV tab
- Upload CSV file with appropriate columns
- System processes all rows
- Download enhanced CSV with predictions
- View analytics and statistics

### **3. Comparisons**
- `/compare-predict` - Compare two prediction sets
- `/see-compare-all` - View all comparisons in history
- Visual side-by-side metrics comparison

### **4. User Management**
- **Admin**: Access `/users` to manage all users
- **Regular Users**: Profile page at `/profile`
- Update personal information, change password

### **5. Data Visualization**
- Charts: Line charts, bar charts, radar charts
- Prediction distribution graphs
- Monthly trend analysis
- User activity heatmaps

---

## 🔐 Security Features

1. **Password Security**
   - PBKDF2 SHA-512 hashing with 16-byte salt
   - Password never transmitted in plain text

2. **Authentication**
   - JWT (JSON Web Token) for stateless authentication
   - Token expiration and refresh mechanisms
   - Role-based authorization (user/admin)

3. **Email Verification**
   - Secure token generation (URLSafeTimedSerializer)
   - Time-limited verification tokens
   - Required before account activation

4. **CORS Security**
   - Restricted to specific origin (http://localhost:5173)
   - Credential support enabled
   - Proper header validation

5. **Data Validation**
   - Server-side input validation
   - File type checking for uploads
   - SQL/NoSQL injection prevention

---

## 📱 Responsive UI Features

- **Tailwind CSS** - Mobile-first responsive design
- **Flexible Grid System** - Adapts to all screen sizes
- **Toast Notifications** - User feedback without page reload
- **Drag-and-drop** - React-DnD for interactive elements
- **Dark Mode Support** - Theme toggle capability

---

## 🤖 Machine Learning Pipeline

### **Model Architecture**
- **Framework**: TensorFlow/Keras
- **Type**: Feedforward Neural Network
- **Input**: 19 normalized features
- **Output**: Continuous yield prediction

### **Data Processing Steps**
1. **Data Validation** - Ensure all required columns
2. **Cleaning** - Handle missing/invalid values
3. **Feature Engineering** - Create derived features
4. **Normalization** - Scale features to 0-1 range
5. **Inference** - Pass through trained model
6. **Post-processing** - Denormalize predictions

### **Metrics Calculated**
- **MAE** (Mean Absolute Error)
- **MSE** (Mean Squared Error)
- **RMSE** (Root Mean Squared Error)
- **R²** (R-squared / Coefficient of Determination)
- **Standard Deviation**
- **Min/Max Predictions**

---

## 🐛 Common Troubleshooting

### **MongoDB Connection Issues**
```bash
# Ensure MongoDB is running
mongosh  # Test connection

# If port conflict, check:
netstat -ano | findstr :27017  # Windows
lsof -i :27017  # macOS/Linux
```

### **CORS Errors**
- Ensure frontend URL in `config.py` matches actual frontend URL
- Check that backend is running before frontend

### **JWT Token Issues**
- Clear localStorage: `localStorage.clear()`
- Re-login to get fresh token
- Check token expiration in config

### **CSV Upload Errors**
- Verify column names match exactly (case-sensitive)
- Ensure data types are correct (numbers vs strings)
- Check file is valid UTF-8 encoded

---

## 📚 Development Tips

### **Frontend Development**
```bash
# Run with TypeScript checking
npm run build

# Check linting
npm run lint

# Hot reload is automatic with Vite dev server
```

### **Backend Development**
```bash
# Debug mode enabled by default in config
# Set breakpoints in PyCharm or VSCode

# Test API endpoints using Postman or cURL
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"Semaine": 1, "Jour apres plantation": 10, ...}'
```

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                  React SPA (TypeScript)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth Pages  │  │ Prediction   │  │  Dashboard   │          │
│  │  (Sign in,   │  │  Pages       │  │  (Stats,     │          │
│  │   Register)  │  │  (Forms,     │  │   Charts)    │          │
│  │              │  │   CSV)       │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                          ▲                                       │
│                          │ HTTP(S)                               │
│                          │ REST API                              │
│                          ▼                                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Axios
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   FLASK REST API (Port 8000)                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Flask-RESTX Namespaces                    │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │   │
│  │  │ /users       │ │ /predict     │ │ /email       │   │   │
│  │  │ (Auth, User  │ │ (Single &    │ │ (Sending     │   │   │
│  │  │  Management) │ │  Batch Pred) │ │  Emails)     │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ▲                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Business Logic & Processing                    │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  ML Module (Prediction Engine)                   │  │   │
│  │  │  - predictor.py (Model inference)                │  │   │
│  │  │  - analyse.py (Metrics & validation)             │  │   │
│  │  │  - feature_engineering.py (Data processing)      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                          ▲                              │   │
│  │                          │                              │   │
│  └──────────────────────────┼──────────────────────────────┘   │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                         │
│                   Database: FlaskApp_DB                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ users        │  │ History      │  │ courses      │          │
│  │ Collection   │  │ Collection   │  │ Collection   │          │
│  │              │  │              │  │              │          │
│  │ - auth data  │  │ - action     │  │ - course     │          │
│  │ - profile    │  │   logs       │  │   info       │          │
│  │              │  │ - predictions│  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Configuration Files

### **Backend Config** (`config.py`)
```python
# Database
MONGODB_SETTINGS = [{
    "db": "FlaskApp_DB",
    "host": "127.0.0.1",
    "port": 27017,
    "alias": "default"
}]

# JWT
JWT_SECRET_KEY = secrets.token_urlsafe(32)

# Email (Gmail SMTP)
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
```

### **Frontend Config** (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react(), svgr()],
  // Build and dev settings
})
```

---

## 🔄 CI/CD & Deployment (Optional Enhancements)

To deploy this application:

1. **Backend**: Deploy to Heroku, AWS, or any Python-capable host
2. **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
3. **Database**: Use MongoDB Atlas (managed cloud service)
4. **Environment Variables**: Use `.env` files or platform-specific secret management

---

## 👥 Team & Contributing

This project demonstrates:
- Full-stack web development with React and Flask
- Machine learning integration in web applications
- RESTful API design
- Database modeling and management
- User authentication and authorization
- Production-ready code structure

---

## 📄 License

[Add your license here - MIT, Apache 2.0, etc.]

---

## 🤝 Support & Questions

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check MongoDB logs for database issues
4. Verify all environment variables are set correctly

---

## 🎓 Key Learning Outcomes

By studying this codebase, you'll learn:
- ✅ How to structure a production-ready full-stack application
- ✅ JWT authentication and authorization patterns
- ✅ RESTful API design with Flask-RESTX
- ✅ MongoDB document modeling with MongoEngine
- ✅ React Hooks and Context API for state management
- ✅ TypeScript in React applications
- ✅ Integration of ML models in web services
- ✅ File upload handling and CSV processing
- ✅ Email integration and verification workflows
- ✅ Responsive UI design with Tailwind CSS
- ✅ Data validation and error handling
- ✅ Security best practices (password hashing, CORS, JWT)

---

**Last Updated**: November 2024  
**Project Type**: Full-Stack Web Application  
**Status**: Active Development  
