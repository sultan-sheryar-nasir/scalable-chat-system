### **User App Documentation**

#### **Overview**

The User App is a backend service that allows users to:

*   Communicate with Admins via WebSocket in real-time.
    
*   Utilize Redis Pub/Sub for cross-instance communication.
    

This application is part of the scalable chat system and interacts with the Admin App and Redis for real-time messaging.

### **Features**

1.  **Real-Time Communication**:
    
    *   WebSocket-based chat functionality.
        
    *   Redis Pub/Sub for cross-instance communication.
        

### **Technologies**

*   **Backend Framework**: NestJS
    
*   **Real-Time Messaging**: Socket.IO, Redis Pub/Sub
    
*   **Containerization**: Docker
    

### **Setup Instructions**

#### **Local Development**

1.  git clone cd scalable-chat-system
    
2.  cd user-app
    
3.  npm install
    
4.  npm run start:dev
    

#### **Production Build**

1.  npm run build
    
2.  npm run start:prod
    

### **WebSocket Communication**

#### **Supported Events**

1.  **sendMessage**:
    
    *   Emits a message to a specified recipient.
        
    *   { "senderId": "user1", "recipientId": "admin1", "content": "Hello, Admin!"}
        
2.  **Redis Pub/Sub Integration**:
    
    *   Publishes messages to the chat channel for cross-instance communication.
        
    *   Subscribes to messages from the chat channel and emits them to WebSocket clients.
        

### **Shared Library Integration**

The User App uses the **shared library** for common functionality. This includes:

1.  **Redis Pub/Sub Utility**:
    
    *   Enables publishing and subscribing to Redis channels.
        
    *   Used for real-time communication between the Admin and User apps.
        
2.  **Models**:
    
    *   ChatMessage: Defines the structure of chat messages exchanged via WebSocket.
        

#### **Steps to Use the Shared Library**

1.  cd ../shared-lib

2.  npm run build
    
3.  npm pack

4.  cp shared-lib-1.0.0.tgz ../user-app/ 
    
5.  cd ../user-app

6.  npm install ../shared-lib/shared-lib-.tgz
    

### **Docker Instructions**

1.  docker build -t user-app .
    
2.  docker run -d -p 3001:3001 --name user-app user-app
    

### **Known Issues**

1.  **Redis Connectivity**:
    
    *   Ensure Redis is running and the REDIS\_HOST and REDIS\_PORT variables are correctly configured.
        
2.  **CORS**:
    
    *   Adjust WebSocket CORS settings if connecting from a different domain or port.
        

### **Testing Instructions**

1.  Use the Postman collection provided in the root directory to test WebSocket communication.
    
2.  Ensure that Redis is running and reachable to verify cross-instance messaging.