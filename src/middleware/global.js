const getCurrentGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning!';
    if (currentHour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
};

const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];
    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };
    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };
    // These functions will be available in EJS templates
    res.locals.renderStyles = () => {
        return res.locals.styles
            // Sort by priority: higher numbers load first
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
    res.locals.renderScripts = () => {
        return res.locals.scripts
            // Sort by priority: higher numbers load first
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
    res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;
    
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];

    // Convenience variable for UI state based on session state
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    
    next();
};