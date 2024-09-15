const Session = require("../model/user").User;

// check authentication for restaurant side

module.exports.authentication = async (req, res, next) => {
    const adminId = req.session.adminId;
    if (!adminId) {
        return res.redirect('/admin/signin?q=session-expired');
    }
    try {
        let user = await Session.find({_id: adminId});
        if (!user) {
            return res.redirect('/admin/signin?q=session-expired');
        }
        next();
    } catch (err) {
        console.log(err);
        res.json({ msg: 'Server error. Please reload page after sometime' })
    }
};