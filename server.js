import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Re-creating __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// --- EJS Configuration ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Render a template instead of sending text
app.get('/', (req, res) => {
    res.render('home', { 
        title: 'Home Page', 
        message: 'Welcome to your EJS Server!' 
    });
});
console.log("Looking for views in:", path.join(__dirname, 'views'));

app.listen(PORT, () => {
    console.log(`🚀 Server with EJS running at http://localhost:${PORT}`);
});