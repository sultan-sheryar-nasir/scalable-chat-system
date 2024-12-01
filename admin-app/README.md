### **Admin App Documentation**

#### **Overview**

The Admin App is a backend service designed for managing posts and facilitating real-time communication with users. It is part of the scalable chat system and interacts with the User App and Redis for real-time messaging.

### **Features**

1.  **Post Management**:
    
    *   Create, Read, Update, and Delete (CRUD) operations for posts.
        
2.  **Real-Time Communication**:
    
    *   WebSocket-based chat functionality.
        
    *   Redis Pub/Sub integration for cross-instance communication.
        

### **Technologies**

*   **Backend Framework**: NestJS
    
*   **Real-Time Messaging**: Socket.IO, Redis Pub/Sub
    
*   **Containerization**: Docker
    

### **Setup Instructions**

#### **Local Development**

1.  clone cd scalable-chat-system
    
2.  cd admin-app
    
3.  npm install
    
4.  npm run start:dev
    

#### **Production Build**

1.  npm run build
    
2.  npm run start:prod
    

### **Environment Variables**

The following environment variables are required to run the Admin App:

*   REDIS\_HOST: The hostname for the Redis server (default: 127.0.0.1).
    
*   REDIS\_PORT: The port number for the Redis server (default: 6379).
    

### **REST API Endpoints**

#### **Post Management**

1.  **Create Post**:
    
    *   Method: POST
        
    *   Endpoint: /posts
        
    *   Description: Create a new post.
        
    *   jsonCopy code{ "title": "Post Title", "content": "Post Content"}
        
2.  **Get All Posts**:
    
    *   Method: GET
        
    *   Endpoint: /posts
        
    *   Description: Retrieve all posts.
        
3.  **Get a Specific Post**:
    
    *   Method: GET
        
    *   Endpoint: /posts/:id
        
    *   Description: Retrieve a single post by its ID.
        
4.  **Update a Post**:
    
    *   Method: PUT
        
    *   Endpoint: /posts/:id
        
    *   Description: Update an existing post.
        
    *   jsonCopy code{ "title": "Updated Title", "content": "Updated Content"}
        
5.  **Delete a Post**:
    
    *   Method: DELETE
        
    *   Endpoint: /posts/:id
        
    *   Description: Delete a post by its ID.
        

### **WebSocket Communication**

#### **Supported Events**

1.  **sendMessage**:
    
    *   Emits a message to a specified recipient.
        
    *   jsonCopy code{ "senderId": "user1", "recipientId": "admin1", "content": "Hello, Admin!"}
        
2.  **Redis Pub/Sub Integration**:
    
    *   Publishes messages to the chat channel for cross-instance communication.
        
    *   Subscribes to messages from the chat channel and emits them to WebSocket clients.
        

### **Shared Library Integration**

The Admin App uses the **shared library** for common functionality. This includes:

1.  **Redis Pub/Sub Utility**:
    
    *   Enables publishing and subscribing to Redis channels.
        
    *   Used for real-time communication between the Admin and User apps.
        
2.  **Models**:
    
    *   ChatMessage: Defines the structure of chat messages exchanged via WebSocket.
        
    *   Post: Defines the structure of posts for CRUD operations.
        

#### **Steps to Use the Shared Library**


1.  cd ../shared-lib

2.  npm run build
    
3.  npm pack

4.  cp shared-lib-1.0.0.tgz ../admin-app/ 
    
5.  cd ../admin-app

6.  npm install ../shared-lib/shared-lib-.tgz
    

### **Docker Instructions**

1.  docker build -t admin-app .
    
2.  docker run -d -p 3000:3000 --name admin-app admin-app
    

### **Known Issues**

1.  **Redis Connectivity**:
    
    *   Ensure Redis is running and the REDIS\_HOST and REDIS\_PORT variables are correctly configured.
        
2.  **CORS**:
    
    *   Adjust WebSocket CORS settings if connecting from a different domain or port.
        

### **Testing Instructions**

1.  Use the Postman collection provided in the root directory to test REST APIs.
    
2.  Use Postman or another Socket.IO client to test WebSocket communication.