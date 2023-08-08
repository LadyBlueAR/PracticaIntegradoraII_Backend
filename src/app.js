import express from 'express';
import __dirname from './utils.js';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import { messageModel } from './dao/mongo/models/messages.model.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';

import products from './routes/products.router.js';
import carts from './routes/carts.router.js';
import views from './routes/views.router.js';
import sessions from './routes/sessions.router.js';

const port = 8080;
const messages = [];
const app = express();
const httpServer = app.listen(port, () => { console.log(`Server listening at http://localhost:${port}`); });
const io = new Server(httpServer);

//conexión mongoDB
mongoose.connect('mongodb+srv://agemignani:Od3cUV0VYj6mn0tO@ecommerce.iwh3tcd.mongodb.net/');

//handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

//Session
app.use (session ({
    store: MongoStore.create({
        mongoUrl:"mongodb+srv://agemignani:Od3cUV0VYj6mn0tO@ecommerce.iwh3tcd.mongodb.net/",
    }),
    secret: "coder secret",
    resave: false,
    saveUninitialized: true,
}));

//Middlewares
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/api/products", products);
app.use("/api/carts", carts);
app.use("/api/sessions", sessions);
app.use("/", views);

//Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

io.on('connection', async (socket) => {
    console.log("Nuevo cliente conectado");

    try {
        const messages = await messageModel.find();
        io.emit('messageLogs', messages);
    } catch (error) {
        console.error("Error al obtener los mensajes:", error);
    }

    socket.on('message', async (data) => {
        try {
            await messageModel.create(data);
            const messages = await messageModel.find();
            io.emit('messageLogs', messages);
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
        }
    });
});