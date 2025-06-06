# Event Management System – CSIT314 Project

This is a full-stack Event Management System developed as part of the CSIT314 Software Engineering module. The system enables users to register for events, organizers to publish and manage events, and administrators to monitor activity and logs.

## ✅ Project Objectives

- Design and implement a functional event management web platform
- Apply Agile methodologies (e.g., Scrum with Sprints) for iterative development
- Practice software engineering principles including modular design, testing, and documentation

## 🔑 Core Features

- User signup/login with secure authentication
- Organizer event publishing and management dashboard
- Public event listing and registration with ticket options
- Simulated VIP payment and digital ticket issuance
- Email confirmations using SendGrid
- Admin dashboard for managing users and viewing logs
- Shortlisting events feature (one-time per user per event)

## 🛠 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Java Spring Boot
- **Database**: PostgreSQL
- **Email**: SendGrid
- **CI/CD**: GitHub Actions
- **Collaboration**: Taiga (Sprint tracking), Microsoft Teams, Telegram

## 🧱 System Architecture

- Microservice-style modular backend
- RESTful API endpoints (documented in controller classes)
- Relational database schema with 1-M and M-M relationships
- UML Diagrams: Use Case, Sequence, Class, Data Persistence (attached in report)

## 🧪 Installation and Run Guide

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL or Docker
- Maven
- SendGrid API Key (if email testing is needed)

### Step 1: Clone the Project

```bash
git clone https://github.com/your-repo/event-management-system.git
cd event-management-system

Step 2: Frontend Setup
cd react-frontend
npm install
npm run dev

Step 3: Backend Setup
cd backend/backend
./mvnw clean install
./mvnw spring-boot:run

Step 4: Environment Configuration
Create an application.properties file in backend/backend/src/main/resources/:

spring.datasource.url=jdbc:postgresql://localhost:5432/your_db
spring.datasource.username=your_username
spring.datasource.password=your_password

sendgrid.api.key=your_sendgrid_key
sendgrid.sender=your_email@example.com

Step 5: Testing
cd backend/backend
./mvnw test

📂 Sprint & Collaboration
Agile methodology applied using 4 development sprints

Sprint tracking and task breakdown available in Taiga (screenshots attached in report)

Collaboration tools: Microsoft Teams (planning), Telegram (communication), GitHub (code versioning)

👥 Team & Responsibilities

📜 Disclaimer
This project was developed for academic purposes as part of the CSIT314 module.