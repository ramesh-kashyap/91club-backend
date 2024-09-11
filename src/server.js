import express from 'express';
import configViewEngine from './config/configEngine';
import connection from "./config/connectDB";
import routes from './routes/web';
import cronJobContronler from './controllers/cronJobContronler';
import middlewareController from './controllers/middlewareController';
// import models from './modal/CreateDatabase';
import socketIoController from './controllers/socketIoController';
const { getColor } = require('./helpers/helper');
const cookieParser = require('cookie-parser');
const i18n = require('./middleware/i18n');
const languageMiddleware = require('./middleware/languageMiddleware');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
import md5 from "md5";
const crypto = require('crypto');


const xssMiddleware = require('./controllers/xssMiddleware');

require('dotenv').config();
const xss = require('xss');

const app = express();
const server = require('http').createServer(app);

const socketIo = require('socket.io');

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingInterval: 25000, // Ping the client every 25 seconds
    pingTimeout: 60000,  // Close the connection if no pong is received within 60 seconds
});

  
const port = process.env.PORT || 3000;
app.use(cookieParser());
app.use(languageMiddleware); // Use the correct middleware here
app.use(i18n.init);

const corsOptions = {
    origin: 'http://localhost:3001', // Client's address
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    credentials: true, // Enabling credentials for secure cross-origin requests
    optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware for Express
app.use(cors(corsOptions));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(xssMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/change-language/:lang', (req, res) => {
    res.cookie('lang', req.params.lang);
    res.redirect('back');
});

app.use(async (req, res, next) => {
    try {            
        const [rows] = await connection.query('SELECT * FROM general_settings WHERE id = 1');
        res.locals.siteName = rows[0].siteName;
        res.locals.Logo = rows[0].logo_path;
        res.locals.home_banner1 = rows[0].home_banner1;
        res.locals.home_banner2 = rows[0].home_banner2;
        res.locals.home_banner3 = rows[0].home_banner3;
        res.locals.home_banner4 = rows[0].home_banner4;
        res.locals.currency = rows[0].currency;
        res.locals.locale = req.getLocale();
        next();
    } catch (err) {
        next(err);
    }
});

// Setup viewEngine
configViewEngine(app);

// Init Web Routes
routes.initWebRouter(app);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: 'mail.bigdaddypro.live', // Your domain's SMTP server (check cPanel for the correct host)
    port: 465, // Typically 465 for SSL or 587 for TLS (check your cPanel settings)
    secure: true, // Use true for 465 (SSL) and false for 587 (TLS)
    auth: {
      user: 'info@bigdaddypro.live', // Your cPanel email address
      pass: 'xB90tlSI&idQ', // Your email account password
    },
  });
  
  // Helper function to generate a random token (6-digit code or a secure string)
  const generateToken = () => crypto.randomInt(100000, 999999).toString();
  
  // POST endpoint to send emails
  // API route for sending OTP to bind email
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists by email
      const [user] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
  
      if (user.length) {
        return res.status(200).json({ message: 'Email is already registered.' });
      }
  
      const otp = generateToken(); // Generate a 6-digit OTP token
  
      // Insert the OTP into the password_resets table, replacing any existing one for that email
      await connection.query('DELETE FROM password_resets WHERE email = ?', [email]); // Clear previous tokens
      await connection.query('INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())', [email, otp]);
  
      // Send OTP email
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP for Email Verification',
        html: `<p>Hello,</p>
               <p>Please use the following OTP to verify your email: <strong>${otp}</strong></p>
               <p>This OTP is valid for 15 minutes.</p>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ message: 'OTP sent to your email successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(200).json({ message: 'Server error' });
    }
  });

  // API route for verifying the OTP
  app.post('/verify-otp', middlewareController, async (req, res) => {
    // Extract the authorization token from the request headers
    const authtoken = req.headers['authorization']?.split(' ')[1];    
    const auth = md5(authtoken);

    console.log('Authorization Token:', authtoken);
    console.log('Hashed Token:', auth);

    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: new Date().toISOString(),
        });
    }

    try {
        // Query to get user information based on the token
        const [user] = await connection.query('SELECT `id`, `name_user`, `invite` FROM users WHERE `token` = ?', [auth]);
        let userInfo = user[0];

        console.log('User Info:', userInfo);

        if (!userInfo) {
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: new Date().toISOString(),
            });
        }

        const { email, otp } = req.body;

        console.log('Email:', email);
        console.log('OTP:', otp);

        // Check if the OTP is valid
        const [resetRecord] = await connection.query('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, otp]);

        console.log('Reset Record:', resetRecord);

        if (!resetRecord.length) {
            return res.status(200).json({ message: 'Invalid or expired OTP.' });
        }

        // Update user's email in the database
        await connection.query('UPDATE users SET email = ? WHERE id = ?', [email, userInfo.id]);

        console.log('Updated user email for ID:', userInfo.id);

        // Optionally, delete the OTP from password_resets to prevent reuse
        await connection.query('DELETE FROM password_resets WHERE email = ?', [email]);

        console.log('Deleted OTP for email:', email);

        return res.status(200).json({ message: 'OTP verified successfully.' });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

  



// Cron job game 1 minute
cronJobContronler.cronJobGame1p(io);

// Check who connects to the server
socketIoController.sendMessageAdmin(io);

// Listen for connections
server.listen(port, () => {
    console.log("Connected successfully on port: " + port);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        // You can choose to use a different port or handle the error as needed
    } else {
        console.error(err);
    }
});
