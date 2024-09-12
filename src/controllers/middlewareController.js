import connection from '../config/connectDB';
import md5 from 'md5'; // Import md5 for hashing

const middlewareController = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Authorization' header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, please log in.' });
    }

    // Hash the token to match the stored hash
    const hashedToken = md5(token);

    try {
        const [rows] = await connection.execute('SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1', [hashedToken]);
        console.log('Database query result:', rows);

        if (!rows.length || hashedToken !== rows[0].token || rows[0].status !== 1) {
            console.log('Invalid token or inactive account');
            return res.status(401).json({ message: 'Unauthorized, please log in.' });
        }

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        return res.status(200).json({ message: 'Internal Server Error' });
    }
};

export default middlewareController;
