const Session = require("../model/user").User;


module.exports.authentication = async (req, res, next) => {
    const userName = req.session.userName;
    if (!userName) {
        return res.redirect('/user/signin?q=session-expired');
    }
    try {
        let user = await Session.find({username: userName});
        if (!user) {
            return res.redirect('/user/signin?q=session-expired');
        }
        next();
    } catch (err) {
        console.log(err);
        res.json({ msg: 'Server error. Please reload page after sometime' })
    }
};