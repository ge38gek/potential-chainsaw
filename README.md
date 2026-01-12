# TripMatch 🌍✈️

TripMatch is an MVP web app that helps travelers discover **destinations they can realistically afford**, based on a short questionnaire and **hybrid cost estimates** (flights + hotels + daily spend).

Instead of asking *“Where should I go?”*, TripMatch answers:

> **“Given my budget, timing, and travel style — where can I actually go?”**



## ✨ Features (MVP)

- Short questionnaire (origin, budget, nights, month, spend style)
- Destination recommendations ranked by affordability
- **Hybrid cost model**:
  - ✈️ Flights: cached/live estimates
  - 🏨 Hotels: city-level average nightly rates
  - 🍴 Daily spend: static tier-based estimates
- Transparent **price ranges** (not fake precision)
- Simple, fast UI (Next.js + Tailwind)



## 🧠 Cost Model (Hybrid)

Trip cost is calculated as:

> **Total = Flight (round trip estimate) + Hotel (avg nightly × nights × seasonality) + Daily spend (tier × days × seasonality)**


Prices are shown as **ranges** (e.g. €820–€980) to stay realistic.

This approach is:
- Fast
- Cheap to operate
- Good enough for inspiration & comparison

---

## 🧱 Tech Stack

- **Next.js (App Router, TypeScript)**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- Optional: Docker for local Postgres

Designed to run locally or in **GitHub Codespaces**.

---


---

## 🚀 Getting Started

### 1) Install dependencies
```bash
npm install
```
### 2) Set environment variables
```env
DATABASE_URL="postgresql://app:app@localhost:5432/tripmatch"
```
### 3) Start Postgres (Docker)
```bash
docker compose up -d
```
### 4) Run migrations & seed data
```bash
npx prisma migrate dev
npx prisma db seed
```
### 5) Start the app
```bash
npm run dev
```

## 📌 Status

### 🚧 Early MVP / Active Development

The goal is speed, clarity, and validation — not perfection.

## 🤝 Contributing

This project is early-stage. Contributions, feedback, and ideas are welcome.

## 📄 License

TBD
