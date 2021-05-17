"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    // function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    // function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("../middlewares/authentication");
const connection_1 = require("../classes/connection");
const listRoutes = express_1.Router();
//Creación de lista
listRoutes.post("/create", authentication_1.verifyToken, (req, res) => {
    connection_1.con.query("ALTER TABLE lists AUTO_INCREMENT = 1", function (err, result) {
        if (err)
            throw err;
    });
    const list = {
        name: req.body.name,
        description: req.body.description || "",
        type: req.body.type || 1,
        user_id: req.user.id,
    };
    let sql = `INSERT INTO lists (name, description, type, user_id) VALUES ('${list.name}', '${list.description}', ${list.type}, ${list.user_id})`;
    connection_1.con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            res.json({
                ok: true,
                id: result.insertId,
                message: "Lista creada con éxito",
            });
        }
    });
});
//Edicion de lista
listRoutes.put("/update", authentication_1.verifyToken, (req, res) => {
    const list = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description || "",
        type: req.body.type || 1,
    };
    let sql = `UPDATE lists SET name='${list.name}', description='${list.description}', type=${list.type}
    WHERE id=${list.id}`;
    connection_1.con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            if (result.affectedRows == 0) {
                res.json({
                    ok: false,
                    message: "No se encontró una lista apropiada para hacer el cambio",
                });
            }
            else {
                console.log("Lista editada");
                res.json({
                    ok: true,
                    message: "La lista se ha actualizado con éxito",
                });
            }
        }
    });
});
//Show active lists
listRoutes.get("/activeLists", authentication_1.verifyToken, (req, res) => {
    let sql = `SELECT id, name, description FROM lists WHERE user_id=${req.user.id} AND type=1`;
    connection_1.con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            if (result.length == 0) {
                res.json({
                    ok: false,
                    message: "No tiene listas pendientes",
                });
            }
            else {
                res.json({
                    ok: true,
                    lists: result,
                });
            }
        }
    });
});
//Show inactive lists
listRoutes.get("/inactiveLists", authentication_1.verifyToken, (req, res) => {
    let sql = `SELECT id, name FROM lists WHERE user_id=${req.user.id} AND type=0`;
    connection_1.con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            if (result.length == 0) {
                res.json({
                    ok: false,
                    message: "No tiene listas terminadas",
                });
            }
            else {
                res.json({
                    ok: true,
                    lists: result,
                });
            }
        }
    });
});
//Show list by id
listRoutes.get("/listById/:id", authentication_1.verifyToken, (req, res) => {
    let resultList = {
        id: String,
        name: String,
        description: String,
        products: [],
    };
    let listInfo = `SELECT id, name, description FROM lists
    WHERE id=${req.params.id}`;
    connection_1.con.query(listInfo, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            if (result.length != 0) {
                resultList["id"] = result[0].id;
                resultList["name"] = result[0].name;
                resultList["description"] = result[0].description;
            }
        }
    });
    let sql = `SELECT p.id, p.name FROM lists l, list_has_products lp, products p
    WHERE l.id=lp.list_id AND lp.product_id=p.id AND l.id=${req.params.id}`;
    connection_1.con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: "Ocurrió un error inesperado. Inténtelo de nuevo",
            });
            throw err;
        }
        else {
            resultList["products"] = result;
            res.json({
                ok: true,
                resultList,
            });
        }
    });
});
listRoutes.post("/delete", authentication_1.verifyToken, (req, res) => {
    let query = `SELECT lp.id FROM lists l, list_has_products lp 
    WHERE l.id=lp.list_id
    AND l.id = ${req.body.id}`;
    connection_1.con.query(query, function (err, result) {
        var result_1, result_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (err)
                throw err;
            try {
                for (result_1 = __asyncValues(result); result_1_1 = yield result_1.next(), !result_1_1.done;) {
                    const item = result_1_1.value;
                    let queryDelete = `DELETE FROM list_has_products WHERE id = ${item.id}`;
                    connection_1.con.query(queryDelete, function (error, resp) {
                        if (error)
                            throw error;
                        console.log("Registro de lista borrado");
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                console.log("error");
            }
            let sql = `DELETE FROM lists WHERE id = ${req.body.id}`;
            connection_1.con.query(sql, function (err, resul) {
                if (err)
                    throw err;
                res.json({
                    ok: true,
                    message: 'Lista borrada con éxito',
                });
            });
        });
    });
});
exports.default = listRoutes;
