import express from 'express';
import configViewEngine from './config/configEngine';
import connection from "./config/connectDB";
import routes from './routes/web';
import cronJobContronler from './controllers/cronJobContronler';
// import models from './modal/CreateDatabase';
import socketIoController from './controllers/socketIoController';
const { getColor } = require('./helpers/helper');
const cookieParser = require('cookie-parser');
const i18n = require('./middleware/i18n');
const languageMiddleware = require('./middleware/languageMiddleware');
const cors = require('cors');

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
