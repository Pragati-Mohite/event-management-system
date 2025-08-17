# Event Management & Ticketing System

A comprehensive event management and ticketing system similar to Eventbrite, built with React.js frontend and Node.js backend.

## Features

### Core Features
- **User Authentication**: Registration, login, and profile management
- **Event Discovery**: Browse and search events by category, location, and date
- **Event Management**: Create, edit, and manage events (for organizers)
- **Ticket Booking**: Secure ticket booking with multiple ticket types
- **QR Code Tickets**: Digital tickets with QR codes for entry verification
- **Payment Processing**: Integrated Stripe payment gateway
- **Responsive Design**: Mobile-friendly interface

### User Roles
- **Attendee**: Browse events, book tickets, view ticket history
- **Organizer**: Create and manage events, view attendee lists, scan QR codes
- **Admin**: Full system access and management

## Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Headless UI** for components
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **QRCode** generation library
- **Stripe** for payment processing
- **Express Validator** for input validation

## Project Structure

```
event-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventsController.js
│   │   └── ticketsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Ticket.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── tickets.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── upload.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── organizer/
│   │   │   │   ├── Events.jsx
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   ├── EditEvent.jsx
│   │   │   │   └── TicketScanner.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── MyTickets.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── App.jsx
│   ├── .env
│   ├── tailwind.config.js
│   ├── package.json
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env file with your MongoDB URI, JWT secret, and Stripe keys
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env file with API URL and Stripe publishable key
   
   # Start the frontend development server
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user profile
- `PUT /api/auth/updatepassword` - Change password
- `GET /api/auth/logout` - Logout user

### Events Endpoints
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Organizer only)
- `PUT /api/events/:id` - Update event (Owner/Admin only)
- `DELETE /api/events/:id` - Delete event (Owner/Admin only)
- `GET /api/events/organizer/me` - Get organizer's events
- `GET /api/events/categories` - Get event categories

### Tickets Endpoints
- `POST /api/tickets` - Book tickets
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id/cancel` - Cancel ticket
- `POST /api/tickets/verify` - Verify QR code (Organizer only)
- `POST /api/tickets/scan` - Scan and mark ticket as used
- `GET /api/tickets/event/:eventId` - Get event tickets (Organizer only)

## Features in Detail

### QR Code System
- Each ticket generates a unique QR code containing encrypted ticket information
- QR codes include ticket number, event ID, user ID, and validation data
- Organizers can scan QR codes to verify ticket authenticity and mark entry
- Tickets expire automatically after the event ends

### Payment Integration
- Stripe payment processing for secure transactions
- Support for multiple ticket types with different pricing
- Automatic payment confirmation and ticket generation
- Refund handling for cancelled tickets

### File Upload System
- Event image uploads with size and format validation
- Automatic image resizing and optimization
- Secure file storage with unique naming

### Security Features
- JWT-based authentication with secure token management
- Password hashing using bcrypt
- Role-based access control
- Rate limiting and request validation
- CORS protection and security headers

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Ensure MongoDB connection string is configured
3. Configure Stripe webhook endpoints
4. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production version: `npm run build`
2. Update API URLs for production environment
3. Deploy to platforms like Vercel, Netlify, or AWS S3

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Note**: This is a comprehensive event management system designed for educational and commercial use. The system includes all major features expected in a modern event booking platform.
