import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth';
import greenSpacesRoutes from './routes/green-spaces';
import citiesRoutes from './routes/cities';
import reportsRoutes from './routes/reports';
import statisticsRoutes from './routes/statistics';
import contactRoutes from './routes/contact';
import citizenReportsRoutes from './routes/citizen-reports';
import adoptionsRoutes from './routes/adoptions';
import commentsRoutes from './routes/comments';
import galleryRoutes from './routes/gallery';
import notificationsRoutes from './routes/notifications';
import predictRoute from "./routes/predict";
import adminUsersRoutes from './routes/admin/users';
import { handleError } from './utils/errorHandler';
import { validateEnv } from './utils/envValidation';
import { swaggerSpec } from './config/swagger';
import csrfProtection from './middleware/csrf';

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

app.use("/api", predictRoute);

// Security headers middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", process.env.SUPABASE_URL || ''],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' }, // Prevent clickjacking
    noSniff: true, // Prevent MIME-type sniffing
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Compression middleware (gzip)
app.use(
  compression({
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// CORS middleware
const allowedOrigins = [
  'https://treecovery.kz',
  'https://www.treecovery.kz',
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000']
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    maxAge: 86400, // 24 hours
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (must be before routes that use cookies)
app.use(cookieParser());

// CSRF protection middleware (after cookie parser)
app.use(csrfProtection);

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Documentation (Swagger)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/green-spaces', greenSpacesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/citizen-reports', citizenReportsRoutes);
app.use('/api/adoptions', adoptionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/users', adminUsersRoutes);

// Error handling middleware (must be after routes)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  handleError(err, res, 'An unexpected error occurred');
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.path} was not found`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;

