import connection from '../config/connectDB';
require('dotenv').config();

const sendMessageAdmin = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Event listeners
        socket.on('data-server', (msg) => {
            io.emit('data-server', msg);
        });

        socket.on('data-server_2', (msg) => {
            io.emit('data-server_2', msg);
        });

        socket.on('data-server-5', (msg) => {
            io.emit('data-server-5', msg);
        });

        socket.on('data-server-3', (msg) => {
            io.emit('data-server-3', msg);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

module.exports = {
    sendMessageAdmin,
};
