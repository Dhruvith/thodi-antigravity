# 📱 ThodiBaat Chat API Documentation

> **Base URL:** `https://your-domain.com/api/v1` (or `http://localhost:3000/api/v1` for local dev)

---

## 🔐 Authentication

All endpoints (except signup and login) require a **Bearer Token** in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

### Token is returned during signup/login. Store it securely in React Native (e.g., `AsyncStorage` or `SecureStore`).

---

## 📋 Quick Reference — All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login and get token |
| `GET` | `/users/me` | Get my profile + unread count |
| `PATCH` | `/users/me` | Update my profile |
| `POST` | `/users/me/status` | Update online status (heartbeat) |
| `GET` | `/users` | Search/list users |
| `GET` | `/users/blocked` | List blocked users |
| `POST` | `/users/blocked` | Block a user |
| `DELETE` | `/users/blocked` | Unblock a user |
| `GET` | `/conversations` | List my conversations |
| `POST` | `/conversations` | Create conversation / group |
| `GET` | `/conversations/poll` | Poll for conversation updates |
| `GET` | `/conversations/:id` | Get conversation details |
| `PATCH` | `/conversations/:id` | Update group (name, members) |
| `DELETE` | `/conversations/:id` | Delete / leave conversation |
| `GET` | `/conversations/:id/messages` | Get messages (paginated) |
| `POST` | `/conversations/:id/messages` | Send a message |
| `PATCH` | `/conversations/:id/messages` | Mark all as read |
| `PATCH` | `/conversations/:id/messages/:msgId` | Edit a message |
| `DELETE` | `/conversations/:id/messages/:msgId` | Delete a message |
| `GET` | `/conversations/:id/poll` | Poll for new messages |
| `POST` | `/upload` | Upload file/image |

---

## 1️⃣ Auth Endpoints

### `POST /auth/signup` — Register

**Request Body:**
```json
{
  "name": "Dhruvith",
  "email": "dhruvith@example.com",
  "password": "mySecurePass123"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dhruvith",
    "email": "dhruvith@example.com",
    "avatar": null,
    "theme": "system",
    "role": "user",
    "createdAt": "2026-02-10T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Missing required fields
- `409` — User already exists

---

### `POST /auth/login` — Login

**Request Body:**
```json
{
  "email": "dhruvith@example.com",
  "password": "mySecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dhruvith",
    "email": "dhruvith@example.com",
    "avatar": null,
    "theme": "system",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid credentials

---

## 2️⃣ User Endpoints

### `GET /users/me` — Get My Profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-...",
    "name": "Dhruvith",
    "email": "dhruvith@example.com",
    "avatar": null,
    "bio": "Hello there!",
    "phone": "+91 98765 43210",
    "theme": "system",
    "role": "user",
    "lastSeen": "2026-02-10T12:00:00.000Z",
    "isOnline": true
  },
  "totalUnreadMessages": 5
}
```

---

### `PATCH /users/me` — Update My Profile

**Headers:** `Authorization: Bearer <token>`

**Request Body (all fields optional):**
```json
{
  "name": "Dhruvith K",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Building ThodiBaat 🚀",
  "phone": "+91 98765 43210",
  "theme": "dark"
}
```

**To change password:**
```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newSecurePass456"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### `POST /users/me/status` — Heartbeat (Online Status)

> ⚡ **Call this every 30 seconds** while the app is active.
> Call with `{ "isOnline": false }` when the app goes to background.

**Request Body:**
```json
{
  "isOnline": true
}
```

**Response (200):**
```json
{
  "message": "Status updated",
  "isOnline": true,
  "lastSeen": "2026-02-10T12:30:00.000Z"
}
```

---

### `GET /users?search=keyword&page=1&limit=20` — Search Users

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | `""` | Search by name or email |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page (max 50) |

**Response (200):**
```json
{
  "users": [
    {
      "id": "...",
      "name": "John",
      "email": "john@example.com",
      "avatar": null,
      "bio": "Hey there!",
      "isOnline": true,
      "lastSeen": "2026-02-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 42,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### `GET /users/blocked` — List Blocked Users

**Response (200):**
```json
{
  "blockedUsers": [
    {
      "id": "...",
      "name": "Spammer",
      "email": "spam@example.com",
      "avatar": null,
      "blockedAt": "2026-02-10T12:00:00.000Z"
    }
  ]
}
```

### `POST /users/blocked` — Block a User

**Request Body:**
```json
{
  "userId": "user-id-to-block"
}
```

### `DELETE /users/blocked` — Unblock a User

**Request Body:**
```json
{
  "userId": "user-id-to-unblock"
}
```

---

## 3️⃣ Conversation Endpoints

### `GET /conversations?page=1&limit=20&search=keyword` — List Conversations

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | `""` | Search by name |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page (max 50) |

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conv-uuid-1",
      "isGroup": false,
      "name": "John",
      "groupAvatar": null,
      "adminId": null,
      "otherParticipants": [
        {
          "id": "user-2",
          "name": "John",
          "email": "john@example.com",
          "avatar": null,
          "isOnline": true,
          "lastSeen": "2026-02-10T12:00:00.000Z"
        }
      ],
      "lastMessage": {
        "id": "msg-uuid",
        "content": "Hey! How are you?",
        "type": "text",
        "senderId": "user-2",
        "createdAt": "2026-02-10T12:30:00.000Z"
      },
      "unreadCount": 3,
      "lastMessageAt": "2026-02-10T12:30:00.000Z",
      "createdAt": "2026-02-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### `POST /conversations` — Create a Conversation

**For 1-on-1 chat:**
```json
{
  "recipientId": "user-id-of-other-person",
  "message": "Hey! Let's chat!"
}
```

**For group chat:**
```json
{
  "isGroup": true,
  "name": "Project Team",
  "participantIds": ["user-id-1", "user-id-2", "user-id-3"],
  "message": "Welcome to the team!"
}
```

**Response (201):**
```json
{
  "id": "new-conv-uuid",
  "isGroup": true,
  "name": "Project Team",
  "adminId": "your-user-id",
  "participants": [...]
}
```

---

### `GET /conversations/:id` — Get Conversation Details

**Response (200):**
```json
{
  "id": "conv-uuid",
  "isGroup": false,
  "name": null,
  "adminId": null,
  "participants": [...],
  "otherParticipants": [...]
}
```

---

### `PATCH /conversations/:id` — Update Group (Admin Only)

**Request Body (all fields optional):**
```json
{
  "name": "New Group Name",
  "groupAvatar": "https://example.com/group.jpg",
  "addParticipantIds": ["user-id-to-add"],
  "removeParticipantIds": ["user-id-to-remove"]
}
```

---

### `DELETE /conversations/:id` — Delete/Leave Conversation

- **Admin of a group** → deletes the entire group and all messages
- **Member of a group** → leaves the group
- **1-on-1 chat** → deletes the conversation and all messages

---

### `GET /conversations/poll?since=2026-02-10T12:00:00Z` — Poll for Updates

> ⚡ **Call this every 5 seconds** on the conversations list screen.

**Response (200):**
```json
{
  "updatedConversations": [
    {
      "id": "conv-uuid",
      "name": "John",
      "lastMessage": { ... },
      "unreadCount": 2,
      "lastMessageAt": "...T12:35:00.000Z"
    }
  ],
  "totalUnreadCount": 7,
  "serverTime": "2026-02-10T12:35:05.000Z"
}
```

> ⚠️ **Use `serverTime` from the response as the `since` parameter in the next poll!**

---

## 4️⃣ Message Endpoints

### `GET /conversations/:id/messages?page=1&limit=50` — Get Messages

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number (newest first) |
| `limit` | number | `50` | Messages per page (max 100) |
| `before` | ISO date | - | Get messages before this time |
| `after` | ISO date | - | Get messages after this time |

**Response (200):**
```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "conversationId": "conv-uuid",
      "senderId": "user-2",
      "sender": {
        "id": "user-2",
        "name": "John",
        "avatar": null
      },
      "content": "Hey! How are you?",
      "type": "text",
      "fileUrl": null,
      "replyToId": null,
      "readBy": ["user-2"],
      "isDeleted": false,
      "createdAt": "2026-02-10T12:30:00.000Z",
      "updatedAt": "2026-02-10T12:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 120,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### `POST /conversations/:id/messages` — Send a Message

**Text message:**
```json
{
  "content": "Hello there!"
}
```

**Image/File message:**
```json
{
  "content": "Check this out!",
  "type": "image",
  "fileUrl": "/uploads/1234567890-photo.jpg"
}
```

**Reply to a message:**
```json
{
  "content": "I agree!",
  "replyToId": "original-message-id"
}
```

**Supported types:** `text`, `image`, `file`, `audio`, `video`, `system`

**Response (201):**
```json
{
  "id": "new-msg-uuid",
  "conversationId": "conv-uuid",
  "senderId": "your-user-id",
  "sender": { "id": "...", "name": "...", "avatar": null },
  "content": "Hello there!",
  "type": "text",
  "createdAt": "2026-02-10T12:35:00.000Z"
}
```

---

### `PATCH /conversations/:id/messages` — Mark All as Read

Call this when the user opens a conversation.

**Response (200):**
```json
{
  "message": "Messages marked as read",
  "count": 5
}
```

---

### `PATCH /conversations/:id/messages/:messageId` — Edit a Message

> ⚠️ Only within **15 minutes** of sending!

**Request Body:**
```json
{
  "content": "Updated message text"
}
```

---

### `DELETE /conversations/:id/messages/:messageId` — Delete a Message

Soft-deletes the message (shows "This message was deleted").

---

### `GET /conversations/:id/poll?since=2026-02-10T12:30:00Z` — Poll for New Messages

> ⚡ **Call this every 2-3 seconds** when inside a conversation.

**Response (200):**
```json
{
  "newMessages": [
    {
      "id": "msg-uuid",
      "sender": { "id": "user-2", "name": "John" },
      "content": "New message!",
      "type": "text",
      "createdAt": "..."
    }
  ],
  "updatedMessages": [
    {
      "id": "edited-msg-id",
      "content": "Edited text",
      "isDeleted": false
    }
  ],
  "participantStatuses": [
    {
      "userId": "user-2",
      "name": "John",
      "isOnline": true,
      "lastSeen": "2026-02-10T12:35:00.000Z"
    }
  ],
  "serverTime": "2026-02-10T12:35:05.000Z"
}
```

> ⚠️ **Always use `serverTime` from the response as the `since` for the next poll!**

---

## 5️⃣ File Upload

### `POST /upload` — Upload a File

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The file to upload |

**Response (200):**
```json
{
  "url": "/uploads/1707561234567-photo.jpg",
  "type": "image/jpeg"
}
```

---

## 📱 React Native Integration Guide

### 1. Setup API Client

```javascript
// api.js
const BASE_URL = 'https://your-domain.com/api/v1';

let authToken = null;

export const setToken = (token) => {
  authToken = token;
};

export const api = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
```

### 2. Auth Flow

```javascript
// Login
const loginUser = async (email, password) => {
  const data = await api('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(data.token);
  // Store token: await AsyncStorage.setItem('token', data.token);
  return data;
};
```

### 3. Real-time Chat with Polling

```javascript
// useMessagePolling.js — Custom hook for real-time messages
import { useEffect, useRef, useState } from 'react';

export const useMessagePolling = (conversationId, interval = 3000) => {
  const [messages, setMessages] = useState([]);
  const lastPollTime = useRef(new Date().toISOString());

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await api(
          `/conversations/${conversationId}/poll?since=${lastPollTime.current}`
        );

        if (data.newMessages.length > 0) {
          setMessages(prev => [...prev, ...data.newMessages]);
        }

        lastPollTime.current = data.serverTime;
      } catch (error) {
        console.error('Poll error:', error);
      }
    };

    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }, [conversationId]);

  return messages;
};
```

### 4. Online Status Heartbeat

```javascript
// Start heartbeat when app is active
import { AppState } from 'react-native';

let heartbeatTimer = null;

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    // Send heartbeat every 30 seconds
    heartbeatTimer = setInterval(() => {
      api('/users/me/status', { method: 'POST', body: { isOnline: true } });
    }, 30000);
    // Send immediately
    api('/users/me/status', { method: 'POST', body: { isOnline: true } });
  } else {
    // App went to background
    clearInterval(heartbeatTimer);
    api('/users/me/status', { method: 'POST', body: { isOnline: false } });
  }
});
```

### 5. File Upload from React Native

```javascript
const uploadFile = async (fileUri, fileName, fileType) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: fileType,
  });

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      // Don't set Content-Type — FormData sets it automatically with boundary
    },
    body: formData,
  });

  return response.json();
};

// Usage: After upload, send message with fileUrl
const sendImage = async (conversationId, imageUri) => {
  const uploaded = await uploadFile(imageUri, 'photo.jpg', 'image/jpeg');
  await api(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: {
      content: 'Sent a photo',
      type: 'image',
      fileUrl: uploaded.url,
    },
  });
};
```

---

## ⚠️ Important Notes

1. **Polling Intervals:**
   - Conversations list: poll every **5 seconds**
   - Inside a chat: poll every **2-3 seconds**
   - Online heartbeat: send every **30 seconds**

2. **Always use `serverTime`** from poll responses as your next `since` value

3. **Token expires** in 7 days. Re-login when you get a `401` response.

4. **File uploads** are saved to `/public/uploads/`. In production, switch to S3 or Cloudinary.

5. **Blocked users** cannot message each other and are hidden from search results.

---

## 🧪 Testing with cURL

```bash
# 1. Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Get users (use token from login)
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Start a conversation
curl -X POST http://localhost:3000/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"recipientId":"OTHER_USER_ID","message":"Hey!"}'

# 5. Send a message
curl -X POST http://localhost:3000/api/v1/conversations/CONV_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Hello from curl!"}'
```

---

*Built with ❤️ for ThodiBaat by Antigravity*
