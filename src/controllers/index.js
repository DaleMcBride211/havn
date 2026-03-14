const homePage = (req, res) => {
    res.render('home', { title: 'Home', stylesheet: 'home.css' });
};

const aboutPage = (req, res) => {
    res.render('about', {title: 'About', stylesheet: 'about.css'});
};

export { homePage, aboutPage };