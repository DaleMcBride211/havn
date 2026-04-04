// src/middleware/error-handler.js
export const notFound = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
};

export const globalErrorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // 1. SAFE DEFAULTS (The bare minimum so header/500.ejs don't crash)
    const env = process.env.NODE_ENV?.toLowerCase() || 'production';
    
    // Inject variables directly into res.locals in case the global middleware failed
    res.locals.NODE_ENV = env;
    res.locals.isLoggedIn = res.locals.isLoggedIn ?? !!req.session?.user;
    res.locals.user = res.locals.user ?? (req.session?.user || null);
    
    if (typeof res.locals.flash !== 'function') {
        res.locals.flash = () => ({ success: [], error: [], warning: [], info: [] });
    }

    // 2. RENDER THE ERROR PAGE
    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        // Make sure the variable names match what 500.ejs expects
        NODE_ENV: env, 
        error: env === 'development' ? err.message : 'An unexpected error occurred',
        stack: env === 'development' ? err.stack : null
    });
};