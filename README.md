# StarClone API (Instagram Clone Backend)

A RESTful API for an Instagram clone application built with **PERN stack** (Node.js, Express, TypeScript, and PostgreSQL).

### 🔗 [Live Demo](https://starclone.vercel.app/)

See the API in action with our frontend at https://starclone.vercel.app/

## Features

- 👤 **User Authentication**: Register, login, JWT-based authentication
- 📝 **Posts**: Create, read, update, delete posts with multiple images
- ❤️ **Social Features**: Like, comment, follow/unfollow
- 🖼️ **Media Upload**: Image upload with AWS S3 integration
- 🔍 **User Profiles**: View and edit user profiles

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, bcrypt
- **File Storage**: AWS S3
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- AWS S3 account (for image uploads)

### Installation

1. Clone the backend repository

```bash
git clone https://github.com/kimjeffsj/starclone-backend.git
cd starclone-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables (create a `.env` file)

```
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=starclone
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3001
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket
```

4. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5001`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts` - Get feed posts
- `GET /api/posts/:id` - Get post details
- `POST /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments, Likes, Follows

- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/likes` - Like post
- `DELETE /api/likes/:postId` - Unlike post
- `POST /api/follows` - Follow user
- `DELETE /api/follows/:username` - Unfollow user

### Media

- `POST /api/media/upload` - Upload media
- `DELETE /api/media` - Delete media

## Project Structure

The project follows a feature-based structure where each feature has its own controllers, routes, services, and validations.

```
src/
  ├── features/         # Features modules
  │   ├── auth/         # Authentication
  │   ├── post/         # Post management
  │   ├── comment/      # Comments
  │   ├── like/         # Likes
  │   ├── follow/       # Follow system
  │   ├── media/        # Media uploads
  │   └── user/         # User profiles
  ├── entities/         # TypeORM entities
  ├── utils/            # Utility functions
  └── config/           # Configuration files
```

## Connecting with Frontend

This backend is designed to work with the [StarClone Frontend](https://github.com/kimjeffsj/starclone-frontend) repository. Make sure the `CORS_ORIGIN` environment variable is set to the URL where your frontend is running.
