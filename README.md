# Beauty Salon Manager

A comprehensive client management system for home-based beauty saloons.

## Features

- Client registration and management
- Service catalog with pricing
- Appointment scheduling
- Price calculation and manual editing
- Analytics dashboard
- Client relationship tracking
- Birthday reminders

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- RESTful API

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Clients
- GET `/api/clients` - Get all clients
- GET `/api/clients/:id` - Get single client
- POST `/api/clients` - Create new client
- PUT `/api/clients/:id` - Update client
- DELETE `/api/clients/:id` - Delete client

### Services
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create new service
- PUT `/api/services/:id` - Update service
- DELETE `/api/services/:id` - Delete service

### Appointments
- GET `/api/appointments` - Get all appointments
- GET `/api/appointments/:id` - Get single appointment
- POST `/api/appointments` - Create new appointment
- PUT `/api/appointments/:id` - Update appointment
- DELETE `/api/appointments/:id` - Delete appointment

## Development

To run in development mode:
```
npm run dev
```

To run tests:
```
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT