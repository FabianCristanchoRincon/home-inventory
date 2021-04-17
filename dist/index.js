"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const user_1 = __importDefault(require("./routes/user"));
const list_1 = __importDefault(require("./routes/list"));
const product_1 = __importDefault(require("./routes/product"));
const body_parser_1 = __importDefault(require("body-parser"));
const connection_1 = require("./classes/connection");
const cors_1 = __importDefault(require("cors"));
const server = new server_1.default();
// middleware
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//configurar cors
server.app.use(cors_1.default({ origin: true, credentials: true }));
//Routes
server.app.use('/user', user_1.default);
server.app.use('/list', list_1.default);
server.app.use('/product', product_1.default);
connection_1.con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected!");
});
server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});
