
GoStream - Deployment and Connection Guide
==========================================

Overview:
---------
GoStream is a microservice-based video streaming platform that supports hybrid deployment 
with encoding on an Ubuntu edge server and all core services (frontend, auth, content, subscription)
hosted on Fly.io. It also integrates Stripe for subscriptions and Resend for email delivery.


Team Memebers :
--------------
1) Siddhartha Vinnakota
2) Manohar Adapa
3) Sanjay Manda
4) Vishal Reddy Vadde
5) Rishma Sree Pathakamuri

Contributions:
--------------

1) Siddhartha Vinnakota : Led the overall architecture design and domain setup (webstream258.online), 
                          built communication between services,
                          Integrated FFmpeg for encoding and exposed the service securely using ngrok

2) Manohar Adapa        : Configured and ran the video encoder service on a self-hosted Ubuntu server
                          and authentication service with JWT and MongoDB

3) Sanjay Manda         : Developed the content service with fallback logic for video uploads,
                          Implemented health checks to detect encoder availability. assisted in cloud deployment 

4) Vishal Reddy Vadde   : Led the frontend development, connecting all backend 
                          services to the user interface , devloped email service.

5) Rishma Sree Pathakamuri: Built the subscription service using Stripe API , 
                            Managed plan-based access logic and data consistency in MongoDB




Project Structure:
------------------
GoStream/
├── frontend/               # React frontend hosted on Fly.io
├── services/
│   ├── auth/              # Auth service (Fly.io)
│   ├── content/           # Content service (Fly.io)
│   ├── subscription/      # Subscription service (Fly.io)
│   └── encoder/           # Video encoder (self-hosted on Ubuntu via Ngrok)

Prerequisites:
--------------
- Node.js (v14+)
- Docker
- Git
- Ngrok (for encoder tunneling)
- MongoDB Atlas account
- Fly.io account
- Stripe account
- Resend account (email API)

Environment Variable Setup:
---------------------------

1. Auth Service (.env)
----------------------
PORT=5001
MONGODB_URI=<MongoDB URI for auth>
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=no-reply@yourdomain.com

2. Content Service (.env)
-------------------------
PORT=5002
MONGODB_URI=<MongoDB URI for content>
ENCODER_SERVICE_URL=https://<ngrok-url>

3. Subscription Service (.env)
------------------------------
PORT=5003
MONGODB_URI=<MongoDB URI for subscription>
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_BASIC_PRICE_ID=your_basic_id
STRIPE_STANDARD_PRICE_ID=your_standard_id
STRIPE_PREMIUM_PRICE_ID=your_premium_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret

4. Frontend (.env)
------------------
REACT_APP_API_URL=https://webstream258.online/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_publishable_key

Deployment Steps:
-----------------

Step 1: Deploy Core Services to Fly.io
--------------------------------------
- Initialize each service:
  fly launch
- Set environment secrets:
  fly secrets set JWT_SECRET=... RESEND_API_KEY=... STRIPE_SECRET_KEY=...
- Deploy:
  fly deploy

Repeat for:
- services/auth
- services/content
- services/subscription
- frontend

Step 2: Host Encoder Service on Ubuntu
--------------------------------------
- Clone repo or save the encoder file in server and navigate to encoder directory:
  git clone <repo-url>
  cd services/encoder
- Install dependencies:
  npm install
- Start server:
  node index.js

Step 3: Expose Encoder with Ngrok
---------------------------------
- Install ngrok:
  sudo snap install ngrok
- Run:
  ngrok http 4000
- Copy HTTPS tunnel and update content service's ENCODER_SERVICE_URL.

Step 4: Deploy MongoDB Atlas
----------------------------
- Create a cluster on MongoDB Atlas
- Whitelist your IP
- Create databases for auth, content, and subscription
- Use connection strings in respective .env files

Step 5: Stripe Configuration
----------------------------
- Create 3 products in Stripe (Basic, Standard, Premium)
- Copy price IDs
- Setup webhook:
  stripe listen --forward-to localhost:5003/api/webhook
- Add webhook secret to .env

Step 6: Domain and HTTPS (via Fly.io)
-------------------------------------
- Purchase and configure DNS (e.g., webstream258.online)
- Point DNS to Fly.io services
- Fly automatically provisions HTTPS certificates

Final Check:
------------
- Encoder reachable via ngrok
- Frontend accessible at https://webstream258.online
- Auth and subscription working
- Video uploads route correctly (encoder fallback working)
- Stripe test payments succeed
- Emails sent via Resend

Security Tips:
--------------
- Never commit `.env` files
- Use Fly.io secrets for production to assign keys 
- Use HTTPS
