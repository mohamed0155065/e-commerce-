# Marketly – High-Performance Full-Stack E-commerce Engine

Marketly is a production-ready e-commerce platform built using a modern full-stack architecture.
The goal of this project is not simply to create an online store, but to demonstrate how to engineer a scalable system with strong architectural design, secure server-side logic, and performance-focused development practices.

This project focuses on clean system structure, reliable data validation, and efficient communication between the frontend and backend.

Live Demo: 

---

## Why This Project Stands Out

Unlike many portfolio projects that focus only on UI, SwiftCart demonstrates real software engineering principles used in production systems.

The application follows a clear separation of responsibilities between the user interface, business logic, and data management layers. This structure allows the system to remain maintainable and scalable as the project grows.

Type safety is enforced across the entire stack using TypeScript, while Zod schemas validate all incoming data to prevent invalid database operations.

Server-side logic is handled using Next.js 15 Server Actions. This keeps sensitive operations such as database mutations and file uploads securely on the server while minimizing unnecessary client-side JavaScript.

Security is also treated as a first-class concern. Administrative routes are protected through Edge Middleware, and the database layer uses Supabase Row Level Security (RLS) to ensure that sensitive data cannot be accessed without proper authorization.

From a performance perspective, the application uses debounced search queries, optimized images, and reduced client-side hydration to improve load times and responsiveness.

---

## Technology Stack

Frontend
Next.js 15 (App Router), Tailwind CSS, Framer Motion

Backend / Backend-as-a-Service
Supabase (PostgreSQL database, authentication, storage, and real-time capabilities)

State Management
Zustand with persistence to maintain cart sessions across page refreshes

Forms and Validation
React Hook Form combined with Zod for strict schema validation

Server Logic
Next.js Server Actions, Middleware, and webhook endpoints

Design System
A custom minimalist theme built around Slate and Indigo color palettes

---

## Key Features

### Shopping Experience

The shopping cart persists between sessions using Zustand's persistence middleware. This allows users to refresh the browser without losing their cart state.

The checkout process uses multi-stage validation powered by Zod to ensure that invalid requests are never sent to the server.

Product pages use dynamic routing and server-side metadata generation, making them SEO-friendly and optimized for search engines.

---

### Search and Filtering

Search functionality includes debouncing to prevent unnecessary database requests during fast typing.

Filtering and search states are synchronized with URL query parameters. This allows users to share links that open directly to filtered product results.

---

### Admin Dashboard

The platform includes a protected administrative dashboard used to monitor store performance.

Sales analytics are visualized through charts built with Recharts, transforming raw order data into meaningful insights such as revenue trends and order volume.

Administrators can upload product images directly to Supabase Storage. Uploaded filenames are sanitized to prevent invalid characters from breaking URLs.

All administrative routes are protected by middleware that verifies authentication before rendering any protected content.

---

### Automation and Real-Time Updates

The dashboard updates automatically when new orders are created using Supabase real-time subscriptions.

The project also includes webhook-ready API routes designed to trigger automated workflows such as sending email or SMS notifications when orders are completed.

---

## Project Structure

The repository follows a modular architecture designed for scalability and maintainability.

app/
Contains the Next.js App Router structure including routes, layouts, and server components.

admin/
Protected administrative routes including the dashboard and order management.

api/
Webhook endpoints and server integrations.

product/
Dynamic routes used for rendering individual product pages.

components/
Reusable UI components and feature-based modules.

lib/
Shared configuration utilities such as Supabase client setup.

services/
Data access layer responsible for interacting with the database and external services.

store/
Global state management using Zustand.

types/
Shared TypeScript interfaces used throughout the project.

validators/
Zod schemas used to enforce validation and data integrity.

---

##  Getting Started

Clone the repo:

Install dependencies: npm install

Setup Environment Variables:  Create a .env.local file 
and add your Supabase URL and Keys.

Run Development Server: npm run dev

---
## 📜 Git Workflow

feat: ... for new features.

fix: ... for bug fixes.

refactor: ... for code optimization.

chore: ... for maintenance.



Developed by: [Mohamed Ibrahim Mohamed]
LinkedIn: [https://www.linkedin.com/in/mohamed-elboraei-84a430361?utm_source=share_via&utm_content=profile&utm_medium=member_android]