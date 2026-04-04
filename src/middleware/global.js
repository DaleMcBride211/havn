// middleware/locals.js
const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning!';
    if (currentHour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
};

const setHeadAssetsFunctionality = (res) => {
    // 1. Initialize with your "must-have" base CSS files
    res.locals.styles = [
        { content: '<link rel="stylesheet" href="/css/global.css">', priority: 1000 }
    ];
    res.locals.scripts = [];

    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    res.locals.renderStyles = () => {
        return res.locals.styles
            // Sort by priority, then by original index to ensure stability
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
};

export const addLocalVariables = (req, res, next) => {
    setHeadAssetsFunctionality(res);

    res.locals.currentYear = new Date().getFullYear();
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
    res.locals.queryParams = { ...req.query };
    
   
    res.locals.greetingText = getCurrentGreeting();
    
  
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];

    res.locals.isLoggedIn = !!(req.session && req.session.user);
    res.locals.user = req.session?.user || null;

    next();
};