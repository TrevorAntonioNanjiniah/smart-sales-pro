# 🛒 Smart E-Commerce Sales Assistant

> An AI-powered dashboard helping Kenyan Instagram, TikTok, and WhatsApp sellers manage chats, leads, and M-Pesa follow-ups — all in one place.

---

 Overview

Smart E-Commerce Sales Assistant is a full-stack AI automation platform built for social commerce sellers in Kenya. It unifies multi-platform sales activity (WhatsApp, Instagram, TikTok) into a single intelligent dashboard, automates customer follow-ups, and handles M-Pesa payments end-to-end — powered by AI.

---

##  Features

-  **AI WhatsApp Sales Agent** — Detects buying intent, collects customer details, and triggers M-Pesa STK Push automatically
-  **Multi-Role Seller Dashboard** — Real-time AI conversation monitoring, Kanban lead pipeline, payment history, and analytics charts
-  **WhatsApp Deep Links** — Pre-loads full product context into every customer chat from the first message
-  **7 n8n Automation Workflows** including:
  - AI caption generator (auto-posts to Instagram, Facebook, TikTok, WhatsApp Status)
  - M-Pesa STK Push payment handler
  - Automated follow-up agent
  - Auto-repost scheduler
  - Daily revenue report
-  **M-Pesa Daraja Integration** — Full STK Push flow: intent detection → payment trigger → Daraja webhook confirmation → auto order creation
-  **Supabase Realtime** — Live dashboard updates powered by a 9-table PostgreSQL schema

---

##  Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, Recharts |
| Backend | Express.js, Webhook Layer |
| Database | Supabase (PostgreSQL), Realtime |
| Automation | n8n (7 workflows) |
| AI | OpenAI |
| Payments | M-Pesa Daraja API |
| Messaging | WhatsApp Cloud API, Meta Graph API |

---

##  Database Schema

The Supabase PostgreSQL database covers **9 tables**:

```
sellers · products · posts · post_analytics · leads · conversations · orders · payments · customers
```

Supabase Realtime is used to push live updates directly to the dashboard without polling.

---

## ⚙️ Architecture

```
WhatsApp Cloud API ──┐
M-Pesa Daraja ───────┼──► Express.js Webhook Layer ──► n8n Automation Workflows ──► Supabase DB
Instagram API ───────┘                                                                    │
                                                                                          ▼
                                                                               Next.js 14 Dashboard
```

The Express.js backend acts as a unified webhook receiver. Each incoming event (WhatsApp message, M-Pesa confirmation, Instagram interaction) is routed to the correct n8n workflow for processing.

---

##  Getting Started

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- Supabase project
- M-Pesa Daraja API credentials
- WhatsApp Cloud API access (Meta Developer account)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/TrevorAntonioNanjiniah/smart-sales-pro.git
cd smart-sales-pro
git checkout mark

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# M-Pesa Daraja
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url

# WhatsApp Cloud API
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
VERIFY_TOKEN=your_webhook_verify_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# n8n
N8N_WEBHOOK_BASE_URL=your_n8n_webhook_url
```

### Running the App

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

---

##  Project Structure

```
smart-sales-pro/
├── backend/
│   ├── routes/          # Webhook endpoints (WhatsApp, M-Pesa, Instagram)
│   ├── controllers/     # Business logic per platform
│   ├── middleware/       # Auth, error handling
│   └── index.js         # Express entry point
├── frontend/
│   ├── app/             # Next.js 14 App Router pages
│   ├── components/      # Dashboard UI components (Kanban, Charts, etc.)
│   └── lib/             # Supabase client, helpers
└── n8n-workflows/       # Exported n8n workflow JSON files
```

---

## 👤 My Contributions

This project was built collaboratively. My specific contributions included:

- Co-built the multi-role seller dashboard in Next.js 14 with Kanban pipeline, real-time AI chat monitoring, M-Pesa payment history, and analytics (Recharts)
- Engineered the Express.js webhook layer routing events from WhatsApp, M-Pesa, and Instagram to the correct n8n workflows
- Designed and implemented 7 n8n AI automation workflows
- Built the WhatsApp deep link system for pre-loading product context into customer chats
- Architected the full Supabase PostgreSQL schema (9 tables) with Realtime integration
- Integrated M-Pesa Daraja STK Push end-to-end

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

##  License

This project is licensed under the MIT License.

---

##  Author

**Mark Onyango**
- GitHub: [@Mark-Ony](https://github.com/Mark-Ony)
- Email: onyangomarkonyango559@gmail.com
