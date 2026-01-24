# VMC Calling Agent & Dashboard

A comprehensive AI-powered system for the Vadodara Municipal Corporation (VMC) to automate complaint registration via voice calls and provide real-time analytics through a modern dashboard.

## 🚀 Key Features

### 📊 Analytics Dashboard (New)
- **Real-time Statistics**: Monitor pending, resolved, and critical complaints.
- **Urgency Classification**: AI-driven categorization of complaints (Critical, High, Medium, Low).
- **Zone-wise Analysis**: Interactive charts showing complaint distribution across zones (North, South, East, West).
- **Department Metrics**: Track performance and load per department.
- **Trend Analysis**: Visual activity trends for the past week.

### 📞 AI Voice Agent
- **Automated Call Handling**: Inbound/Outbound call management using Twilio.
- **Speech-to-Text**: Transcription of user complaints.
- **Multilingual Support**: Handling Gujarati, Hindi, and English.
- **Auto-Registration**: Direct insertion of voiced complaints into the database.
- **SMS Confirmation**: Instant SMS notification sent to the caller with their unique Complaint ID for tracking.

## 🛠 Type Stack

### Frontend (Dashboard)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend (Analytics API)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [MongoDB](https://www.mongodb.com/) (pymongo)
- **Validation**: Pydantic
- **ML/AI**:
  - [Scikit-learn](https://scikit-learn.org/) (TF-IDF for text features)
  - [RapidFuzz](https://github.com/maxbachmann/RapidFuzz) (Fuzzy string matching for categories)
  - [Hugging Face Transformers](https://huggingface.co/) (DistilBERT `distilbert-base-uncased` for semantic understanding)

### Voice Service (Telephony)
- **Runtime**: Node.js
- **Telephony**: Twilio Voice API & Messaging API (SMS)
- **AI Modules**: Custom speech processing modules (in `src`)



## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9 - v3.12)
- MongoDB Connection URI

### 1. Backend Setup (FastAPI)
Navigate to the `fast_api` directory:
```bash
cd fast_api
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Run the API:
```bash
python -m uvicorn app.main:app --reload
# API runs at http://localhost:8000
```

### 2. Frontend Setup (React)
Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies and start dev server:
```bash
npm install
npm run dev
# Dashboard runs at http://localhost:5173
```

## 🔐 Configuration
Create a `.env` file in the root or respective folders with the following keys:
- `MONGO_URI`: Your MongoDB connection string.
- `TWILIO_ACCOUNT_SID`: (For Voice Agent)
- `TWILIO_AUTH_TOKEN`: (For Voice Agent)
