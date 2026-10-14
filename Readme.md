# GoStream

**Full-stack video streaming platform built with React, Node.js microservices, MongoDB, FFmpeg, and Stripe.**

GoStream is an end-to-end streaming application combining a React user interface with independently deployable services for authentication, content management, subscriptions, and video encoding. The project explores the engineering challenges behind a streaming product: media ingestion and processing, service-to-service communication, payment integration, containerization, and cloud deployment.

## Highlights

- **Streaming experience:** video browsing, playback, profiles, personal lists, and dedicated movie/TV pages.
- **Authentication and access control:** registration, login, JWT-based authentication, protected routes, and administrative functionality.
- **Video management and processing:** upload workflows backed by a content service and an FFmpeg-based encoder with a health endpoint.
- **Subscriptions:** Stripe-powered plans, subscription management, and webhook handling.
- **Service-oriented backend:** separate Node.js/Express services with MongoDB persistence.
- **Deployment tooling:** Dockerfiles, Fly.io configurations, Kubernetes manifests, NGINX ingress, and TLS configuration.
- **Load-testing example:** an Artillery scenario for user registration.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, React Router, Redux Toolkit, Material UI, Axios, React Player |
| Backend | Node.js, Express, REST APIs |
| Data and authentication | MongoDB, Mongoose, JWT, bcrypt |
| Video processing | FFmpeg, Multer |
| Payments and notifications | Stripe, Resend integration |
| Infrastructure | Docker, Fly.io, Kubernetes, NGINX, cert-manager |
| Testing | Jest tooling, Artillery load-test configuration |

## Architecture

```text
                      +----------------------+
                      |   React Frontend     |
                      |  Browse / Play / UI  |
                      +----------+-----------+
                                 |
                         HTTPS / REST APIs
                                 |
            +--------------------+--------------------+
            |                    |                    |
     +------v------+      +------v------+      +------v--------+
     | Auth Service|      |Content Service|     | Subscription  |
     | JWT / Users |      | Videos/Uploads|     | Stripe/Webhook |
     +------+------+      +------+-------+     +------+--------+
            |                    |                    |
        MongoDB               MongoDB               MongoDB
                                 |
                         Video encoding flow
                                 |
                         +-------v--------+
                         | Encoder Service|
                         |     FFmpeg     |
                         +----------------+
```

The repository contains both **Fly.io deployment files** for individual components and **Kubernetes manifests** for a container-orchestrated deployment. The original project documentation also describes a hybrid setup with a self-hosted Ubuntu encoder exposed through an HTTPS tunnel. These are deployment approaches represented in the project, not a claim that every environment is currently live.

## Repository structure

```text
Gostream/
├── frontend/                       # React interface and pages
├── services/
│   ├── auth/                        # Accounts, authentication, user management
│   ├── content/                     # Videos and upload endpoints
│   ├── subscription/                # Stripe subscriptions and webhooks
│   └── video-encoder-service/       # FFmpeg processing and health endpoint
├── k8s/                             # Kubernetes workloads, services, ingress, TLS
├── artillery-tests/                 # Load-testing configuration
├── package.json                     # Root development scripts
└── Readme.md
```

## Getting started

### Prerequisites

- Node.js and npm (use an actively supported Node.js LTS release compatible with these dependencies)
- MongoDB instance or MongoDB Atlas connection string
- Stripe test-mode credentials for subscription features
- An available FFmpeg encoder service for video-processing workflows

Docker, Kubernetes, Fly.io, and ngrok are **optional** and needed only for the corresponding deployment approach.

### 1. Clone and install

```bash
git clone https://github.com/vssdvns/Gostream.git
cd Gostream
npm run install:all
cd services/video-encoder-service && npm install
cd ../..
```

The root `install:all` script installs the frontend, auth, content, and subscription dependencies. Install the encoder's dependencies separately as shown.

### 2. Configure environment variables

Create local `.env` files for each service as appropriate. **Never commit real credentials.** For example:

**`services/auth/.env`**
```dotenv
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/gostream-auth
JWT_SECRET=replace-with-a-long-random-secret
```

**`services/content/.env`**
```dotenv
PORT=5003
MONGODB_URI=mongodb://127.0.0.1:27017/gostream-content
```

**`services/subscription/.env`**
```dotenv
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/gostream-subscriptions
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_BASIC_PRICE_ID=price_replace_me
STRIPE_STANDARD_PRICE_ID=price_replace_me
STRIPE_PREMIUM_PRICE_ID=price_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
AUTH_API_URL=http://localhost:5001
CONTENT_API_URL=http://localhost:5003
SUBSCRIPTION_API_URL=http://localhost:5002
```

Set the frontend's `REACT_APP_*` configuration for your local API endpoints and Stripe publishable key according to the integration being used. The example ports above align with the Kubernetes ingress service mappings; verify the port defaults and API URLs in your environment before launching.

### 3. Run the application

In one terminal, start the main services and frontend using the repository script:

```bash
npm start
```

In another terminal, run the encoder:

```bash
cd services/video-encoder-service
npm start
```

The encoder exposes `GET /health` and `POST /encode`. Review the frontend and service configuration for the exact base URLs used in your setup.

> **Setup note:** This repository includes configuration for multiple deployment environments. Local startup may require adjusting hard-coded endpoints, CORS settings, or service URLs. A successful dependency install alone does not guarantee all external integrations are configured.

## Deployment options

### Containerized / Kubernetes deployment

The `k8s/` directory includes manifests for the frontend and API services, environment configuration, an NGINX ingress, and certificate management. Configure your container images, secrets, DNS, and cluster-specific settings before applying manifests.

### Fly.io + Ubuntu encoder

The repository also includes `fly.toml` files and Dockerfiles for service deployment. In the hybrid approach documented during development, the core application ran on Fly.io while video encoding ran on Ubuntu and was exposed through ngrok. For this topology:

1. Deploy the application services and configure their environment secrets.
2. Start `services/video-encoder-service/` on the Ubuntu machine.
3. Expose the encoder securely and connect the upload-processing flow to its reachable endpoint.
4. Configure MongoDB, Stripe webhooks, service URLs, DNS, and HTTPS.

**Do not expose administrative endpoints, credentials, or unauthenticated upload/encode endpoints publicly without appropriate safeguards.**

## Testing

The repository contains an Artillery load-test example under `artillery-tests/gostream-test.yml`. It targets a registration endpoint and can be adapted to the environment under test. This is a test configuration, **not a published throughput or scalability benchmark**.

## Engineering focus

GoStream demonstrates practical full-stack and cloud engineering across API design, distributed service integration, video-processing workflows, payment handling, frontend state management, and deployment configuration. Its different infrastructure configurations make it useful for experimenting with trade-offs between separately hosted services and Kubernetes orchestration.

## Security and operations

- Use environment variables or managed secrets for MongoDB, JWT, Stripe, and email API keys.
- Use Stripe **test mode** during local development and validate webhooks.
- Configure HTTPS, appropriate CORS policies, and authentication for sensitive routes.
- Keep development credentials out of version control; rotate any secrets that were previously committed.
- Validate service health, media upload limits, and storage handling before production use.

---

**Project repository:** [vssdvns/Gostream](https://github.com/vssdvns/Gostream)
