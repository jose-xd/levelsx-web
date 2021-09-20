const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    } req.flash('error_msg', 'Not Authenticated');
    res.redirect('/');
};

module.exports = helpers;