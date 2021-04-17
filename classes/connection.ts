import mysql from "mysql";

export var con = mysql.createConnection({
    host: "localhost",
    database: "home_inventory",
    user: "root",
    password: ""
});