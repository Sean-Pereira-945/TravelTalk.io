# TravelTalk.io

A modern blog website focused on historical content, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Responsive design with modern UI
- Create and view blog posts
- Search functionality
- Contact form with social media links
- Real-time notifications
- Mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd historical-blogs
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
historical-blogs/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
└── README.md
```

## Deployment

1. Set up your MongoDB Atlas account and get your connection string
2. Deploy to Vercel:
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 
