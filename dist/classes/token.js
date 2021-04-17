"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Token {
    constructor() { }
    static getJwtToken(payload) {
        return jsonwebtoken_1.default.sign({
            user: payload
        }, this.seed, { expiresIn: this.caducity });
    }
    static checkToken(userToken) {
        return new Promise((res, rej) => {
            jsonwebtoken_1.default.verify(userToken, this.seed, (err, decoded) => {
                if (err) {
                    rej();
                }
                else {
                    res(decoded);
                }
            });
        });
    }
}
exports.default = Token;
Token.seed = 'seed-home-inventory';
Token.caducity = '30d';
