import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';

import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';
import flash from './src/middleware/flash.js';

import routes from './src/controllers/routes/routes.js';
import { addLocalVariables } from './src/middleware/global.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

const app = express();

// Required for secure cookies on Render/Proxies
app.set('trust proxy', 1);

// --- EJS Configuration ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            ssl: {
                ca: caCert,
                rejectUnauthorized: true,
                checkServerIdentity: () => { return undefined; }
            }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET, // Ensure this is a string in your .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Initialize cleanup utility
startSessionCleanup();

// Body parsing and static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Custom Middlewares
app.use(flash);
app.use(addLocalVariables); // Injects isLoggedIn, user, etc.

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Final Error Handler (The Bulletproof Version)
app.use((err, req, res, next) => {
    if (res.headersSent || res.finished) return next(err);
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // --- FIX FOR "flash is not defined" ---
    // If the flash middleware didn't run, we provide a dummy function 
    // that returns an empty object so the header doesn't crash.
    if (typeof res.locals.flash !== 'function') {
        res.locals.flash = () => ({}); 
    }

    // Safety net for other global variables
    res.locals.isLoggedIn = res.locals.isLoggedIn || !!(req.session && req.session.user);
    res.locals.user = res.locals.user || (req.session?.user || null);
    res.locals.currentYear = res.locals.currentYear || new Date().getFullYear();
    res.locals.greeting = res.locals.greeting || ''; 
    
    // Ensure styles/scripts arrays exist
    res.locals.styles = res.locals.styles || [];
    res.locals.scripts = res.locals.scripts || [];
    res.locals.renderStyles = res.locals.renderStyles || (() => '');
    res.locals.renderScripts = res.locals.renderScripts || (() => '');

    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV
    });
});

// Start Server
app.listen(PORT, async () => {
    try {
        await setupDatabase();
        await testConnection();
        console.log(`Server is running on port: ${PORT}`);
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
});