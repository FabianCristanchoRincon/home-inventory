"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.con = void 0;
const mysql_1 = __importDefault(require("mysql"));
exports.con = mysql_1.default.createConnection({
    host: "localhost",
    database: "home_inventory",
    user: "root",
    password: ""
});
