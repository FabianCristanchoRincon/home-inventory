import Server from "./classes/server";
import userRoutes from "./routes/user";
import listRoutes from "./routes/list";
import productRoutes from "./routes/product";
import bodyParser from "body-parser";
import { con } from "./classes/connection"
import cors from 'cors'

const server = new Server();


// middleware
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());

//configurar cors
server.app.use(cors({ origin:true, credentials:true}));


//Routes
server.app.use('/user', userRoutes);
server.app.use('/list', listRoutes);
server.app.use('/product', productRoutes);

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
})