import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Utils
import { sessionConfig } from './src/config/session.js';
import { setupDatabase, testConnection } from './src/models/setup.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

// Middleware
import flash from './src/middleware/flash.js';
import { addLocalVariables } from './src/middleware/global.js';
import { notFound, globalErrorHandler } from './src/middleware/error-handler.js';

// Routes
import routes from './src/controllers/routes/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware Stack
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionConfig);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash);
app.use(addLocalVariables);

// Start logic
startSessionCleanup();

// Routes
app.use('/', routes);

// Error Handling
app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await setupDatabase();
        await testConnection();
        console.log(`Server is running on port: ${PORT}`);
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
});