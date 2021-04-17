"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("../middlewares/authentication");
const connection_1 = require("../classes/connection");
const productRoutes = express_1.Router();
productRoutes.get('/ejemplo', (req, res) => {
    res.send("prueba de ejemplo");
});
productRoutes.post('/create_new', authentication_1.verifyToken, (req, res) => {
    const product = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        list_id: req.body.list_id,
        quantity: req.body.quantity
    };
    let sqlProduct = `INSERT INTO products (name, description, price) VALUES ('${product.name}', '${product.description}', ${product.price})`;
    connection_1.con.query(sqlProduct, function (err, result) {
        if (err)
            throw err;
        let sqlHistorial = `INSERT INTO list_has_products (list_id, product_id, quantity) VALUES (${product.list_id}, ${result.insertId}, ${product.quantity})`;
        connection_1.con.query(sqlHistorial, function (error, resHistory) {
            if (error)
                throw error;
            res.json({
                ok: true,
                message: 'Producto ingresado en la lista correctamente'
            });
        });
    });
});
productRoutes.post('/deleteFromList', authentication_1.verifyToken, (req, res) => {
    let reqDelete = {
        id_list: req.body.list_id,
        id_product: req.body.product_id
    };
    let sql = `DELETE FROM list_has_products WHERE list_id = ${reqDelete.id_list} AND product_id = ${reqDelete.id_product}`;
    connection_1.con.query(sql, function (err, result) {
        if (err)
            throw err;
        res.json({
            ok: true,
            message: "Producto borrado de la lista"
        });
    });
});
productRoutes.get("/products", authentication_1.verifyToken, (req, res) => {
    let sql = `SELECT p.id, p.name, p.description, p.price, lp.quantity, l.id as list_id, l.name as list_name FROM products p, list_has_products lp, lists l
    WHERE p.id=lp.product_id AND lp.list_id=l.id AND l.user_id = ${req.user.id}`;
    connection_1.con.query(sql, function (err, result) {
        if (err)
            throw err;
        res.json({
            ok: true,
            result
        });
    });
});
productRoutes.get("/productsById/:id", authentication_1.verifyToken, (req, res) => {
    let sql = `SELECT p.name, p.description, p.price, lp.quantity, l.id as list_id, l.name as list_name FROM products p, list_has_products lp, lists l
    WHERE p.id=lp.product_id AND lp.list_id=l.id AND l.user_id = ${req.user.id} AND p.id = ${req.params.id}`;
    connection_1.con.query(sql, function (err, result) {
        if (err)
            throw err;
        res.json({
            ok: true,
            product: result[0]
        });
    });
});
exports.default = productRoutes;
