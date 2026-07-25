
## BACKEND README.md

```markdown
# API-Driven Tabung Haji Hajj Management System (Backend)

This repository contains the backend API of my Final Year Project, an API-driven Tabung Haji Hajj Management System developed using Node.js, Express.js, and PostgreSQL.

The backend provides RESTful API services for authentication, Hajj registration, deposit management, offer processing, appeal workflows, document management, and administrative reporting.

## Project Overview

The backend serves as the core application layer responsible for handling business logic, database operations, and communication between the frontend application and PostgreSQL database.

The system manages:

- User authentication
- Hajj registration workflows
- Deposit and transaction handling
- Hajj offer management
- Appeal processing
- Document management
- Administrative monitoring
- Supervisor analytics

This project demonstrates practical backend development experience in designing REST APIs, integrating databases, and implementing server-side application workflows.

---

## My Contribution

I was responsible for:

- Developing RESTful APIs using Node.js and Express.js
- Designing API routes and backend logic
- Integrating PostgreSQL database operations
- Implementing authentication workflows
- Developing Hajj registration and appeal processes
- Handling document uploads
- Generating PDF offer letters
- Developing dashboard APIs for reporting and analytics

---

## Backend Responsibilities

The backend handles:

- User registration and authentication
- Hajj registration processing
- Deposit and transaction management
- Hajj offer creation and decision handling
- Appeal submission and review workflows
- Document upload management
- Admin dashboard services
- Hajj quota management
- Supervisor analytics endpoints

---

## Technologies Used

### Backend
- Node.js
- Express.js
- JavaScript
- PostgreSQL

### Libraries
- pg (PostgreSQL client)
- bcrypt (Password hashing)
- Multer (File upload handling)
- pdfmake (PDF generation)
- cors
- node-fetch

### Tools
- Postman
- Visual Studio Code
- Git

---

## API Architecture

The backend follows a modular Express.js architecture.


Backend API
│
├── index.js
│ Server entry point
│
├── connection.js
│ PostgreSQL database connection
│
└── routes/
├── auth.js
├── user.js
├── hajj.js
├── admin.js
└── supervisor-dashboard.js


API route groups:


/api/auth
/api/user
/api/hajj
/api/admin
/api/supervisor


---

## Database Design

The application uses PostgreSQL as the primary database.

Main database entities include:

- User
- Hajj_Registration
- Hajj_Offer
- Hajj_Quota
- Hajj_Season
- Transaction
- Hajj_Appeal
- User_Documents
- Hajj_Appeal_Documents

The system also uses SQL views for dashboard statistics and reporting.

---

## API Features

### Authentication

- User registration
- User login
- Admin authentication
- Supervisor authentication

### Hajj Management

- Hajj registration processing
- Registration status tracking
- Deposit handling
- Transaction history retrieval
- Appeal submission and tracking

### Administration

- Application review
- Hajj quota management
- Offer management
- Appeal decision processing
- Dashboard statistics

### Supervisor Analytics

- Applicant demographic statistics
- Hajj offer statistics
- Appeal statistics

---

## Installation

### Prerequisites

Required:

- Node.js
- npm
- PostgreSQL

### Setup

Clone repository:

```bash
git clone <repository-url>

Navigate to project:

cd th-hajj-management-backend

Install dependencies:

npm install

Start server:

node index.js

API will run at:

http://localhost:5050
Database Setup

To run the backend:

Install PostgreSQL
Create a project database
Configure database connection
Import required tables and views

Required database entities:

User
Hajj_Registration
Hajj_Offer
Hajj_Quota
Hajj_Season
Transaction
Hajj_Appeal
User_Documents
Hajj_Appeal_Documents
API Testing

The API can be tested using:

Postman
Insomnia
curl

Testing includes:

Authentication requests
Database operations
File upload workflows
Dashboard API responses
Business workflow validation
Security Implementation

The backend implements:

Password hashing using bcrypt
File upload validation
File size restrictions
CORS configuration
Data validation during workflows
Future Improvements

Possible improvements:

Implement JWT authentication middleware
Add environment variable configuration
Add Swagger/OpenAPI API documentation
Expand automated API testing
Improve API validation
Refactor database operations into service layers
Summary

This backend project demonstrates practical backend development experience using Node.js, Express.js, and PostgreSQL.

It showcases skills in REST API development, database integration, authentication workflows, file handling, and server-side application design for a complete full-stack system.
