# Scalable Chat System

## Overview
The Scalable Chat System is a real-time messaging platform designed for scalability and reliability. Built using NestJS, Socket.IO, and Redis, it enables seamless communication between Admins and Users with support for horizontal scaling using Kubernetes.

## This project includes
- **Admin App:** Allows administrators to communicate with Users and other Admins.
- **User App:** Enables Users to communicate with Admins.
- **Shared Library:** Contains common utilities and models shared between the apps.
- **Redis:** Used for Pub/Sub messaging to ensure cross-instance communication.
- **Kubernetes Deployment:** Ensures scalability and fault tolerance with 3 replicas per app.

# Features
- **Real-Time Messaging:**
   - Admins can communicate with Users and other Admins.
   - Users can only communicate with Admins.
- **Pub/Sub Communication:**
   - Redis-backed message broadcasting ensures communication across distributed instances.
- **Scalability:**
   - Kubernetes deployment with load balancing for high availability.
- **Event-Driven Updates:**
   - Server-Sent Events (SSE) for real-time updates.
- **Microservices Architecture:**
   - Modular design with separate services for Admins, Users, and shared logic.
  
 # Architecture
## Key Components
- **Admin App:**
    - Handles Admin connections and messaging.
- **User App:**
    - Manages User connections and messaging.
- **Shared Library:**
    - Includes shared utilities such as Redis Pub/Sub and data models.
- **Redis:**
    - Provides Pub/Sub capabilities for real-time messaging.
- **Kubernetes Deployment:**
    - Ensures fault tolerance and scalability.
 
# Setup and Installation
## Prerequisites
* Docker and Docker Compose installed.
* Node.js (v16 or higher) and npm installed.
* A running Redis instance (for local development).

## Run Locally with Docker
* Clone the repository:
    ```cmd
    git clone https://github.com/your-username/scalable-chat-system.git
    cd scalable-chat-system
* Start the services:
    ```cmd
    docker-compose up --build
* The services will run on the following ports:
    * Admin App: http://localhost:3000
    * User App: http://localhost:3001
 
## Run Locally Without Docker
* Install dependencies for each app:
    ```cmd
    cd admin-app && npm install && cd ..
    cd user-app && npm install && cd ..
    cd shared-lib && npm install && cd ..
* Start Redis:
    ```cmd
    redis-server
* Run the apps:
    * **Admin App:**
        ```cmd
        cd admin-app
        npm run start:dev
    * **User App:**
        ```cmd
        cd user-app
        npm run start:dev
        
# Endpoints
## Admin App
* WebSocket:
    * ws://localhost:3000/socket.io?adminId=admin1
* REST APIs:
    * GET /posts: Fetch all posts.
    * GET /posts: Fetch posts by id.
    * POST /posts: Create a new post.
    * PUT /posts: Update a post.
    * DELETE /posts: Delete a  post.
    * GET /posts/updates: Server-Sent Events for updates.
## User App
* WebSocket:
    * ws://localhost:3001/socket.io?userId=user1
 
# Deployment
## Kubernetes Deployment
* Ensure you have kubectl and a running Kubernetes cluster.
* Deploy the services:
    ```cmd
    kubectl apply -f k8s/
* Verify the pods are running:
    ```cmd
    kubectl get pods
*  Access the services via a Load Balancer or Ingress.

# How It Works
## Messaging Flow
* Message Sending:
    * The message is sent via WebSocket to the respective ChatGateway (Admin or User).
* Message Broadcasting:
    * The ChatGateway publishes the message to the Redis chat channel.
* Message Processing:
    * The recipient's ChatGateway subscribes to the Redis chat channel and forwards the message to the appropriate socket ID.

## Real-Time Updates
* SSE endpoints push updates such as new posts or events directly to clients in real time.

