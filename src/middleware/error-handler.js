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

    // ... all your safety net logic for res.locals ...

    res.status(status).render(`errors/${template}`, {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};