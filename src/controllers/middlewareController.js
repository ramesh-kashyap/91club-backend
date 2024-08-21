import connection from '../config/connectDB';

const middlewareController = async (req, res, next) => {
    const auth = req.cookies.auth;

    if (!auth) {
        return res.status(401).json({ message: 'Unauthorized, please log in.' });
    }

    try {
        const [rows] = await connection.execute('SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1', [auth]);
        
        if (!rows.length || auth !== rows[0].token || rows[0].status !== '1') {
            res.clearCookie("auth");
            return res.status(401).json({ message: 'Unauthorized, please log in.' });
        }

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default middlewareController;
