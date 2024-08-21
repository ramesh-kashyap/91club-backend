import connection from '../config/connectDB';
import md5 from 'md5'; // Import md5 for hashing

const middlewareController = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Authorization' header
    console.log('Token:', token);

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: 'Unauthorized, please log in.' });
    }

    // Hash the token to match the stored hash
    const hashedToken = md5(token);
    console.log('Hashed Token:', hashedToken);

    try {
        const [rows] = await connection.execute('SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1', [hashedToken]);
        console.log('Database query result:', rows);

        if (!rows.length || hashedToken !== rows[0].token || rows[0].status !== 1) {
            console.log('Invalid token or inactive account');
            return res.status(401).json({ message: 'Unauthorized, please log in.' });
        }

        console.log('Token validated, proceeding to next middleware');
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Error during authentication check:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default middlewareController;
