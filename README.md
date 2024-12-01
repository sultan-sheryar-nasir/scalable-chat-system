# Scalable Chat System

## Overview
This project is a scalable chat system consisting of:
1. **Admin App**:
   - Manages posts via REST APIs.
   - Provides WebSocket-based real-time chat with users.
2. **User App**:
   - Enables users to interact with Admins via WebSocket.
3. **Shared Library**:
   - Contains common utilities like Redis Pub/Sub, models, and logic.
4. **Redis**:
   - Acts as the message broker for WebSocket communication across multiple instances.

## Technologies Used
- **Backend**: NestJS
- **Real-Time Communication**: Socket.IO, Redis Pub/Sub
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Optional)

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed.
- Node.js and npm installed for local development.
- Kubernetes CLI (`kubectl`) for Kubernetes deployment.

### Local Development
docker-compose up --build


## ** In the root directory a .docx document can also be found with all in depth details **