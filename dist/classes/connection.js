"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.con = void 0;
const mysql_1 = __importDefault(require("mysql"));
exports.con = mysql_1.default.createConnection({
    host: "bdfw3016n0e9jabh5fto-mysql.services.clever-cloud.com",
    database: "bdfw3016n0e9jabh5fto",
    user: "ubfsr3ob157jitbe",
    password: "BVXtaIlVnN2ITKj3drZe"
});
