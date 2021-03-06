import { Request, Response, Router } from "express";
import bcryptjs from "bcryptjs";
import Token from "../classes/token";
import { verifyToken } from "../middlewares/authentication";
import { con } from "../classes/connection";

const userRoutes = Router();


userRoutes.get('/ejemplo', (req,res)=> {
    res.send("prueba de ejemplo")
});

//Inicio de sesión
userRoutes.post("/login", (req: Request, res: Response) => {
    const body = req.body;
    let sql = `SELECT username, password, status FROM users WHERE username = '${body.username}'`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            const data = result[0];
            if (data.status == 0) {
                res.json({
                    ok: false,
                    message: 'El usuario no se encuentra activo en el sistema. Por favor comuniquese con los administradores para que activen la cuenta'
                })
            } else {
                if (bcryptjs.compareSync(body.password, data.password)) {
                    let queryPerson = `SELECT u.id AS id, name, last_name, email, avatar, roles_idRoles FROM persons p, users u, user_has_roles r WHERE p.user_id = u.id AND u.username = '${body.username}' AND r.user_id = u.id`;
                    con.query(queryPerson, function (err, resp) {
                        if (err)
                            throw err;
                        let infoPerson = resp[0];


                        const tokenUser = Token.getJwtToken({
                            id: infoPerson.id,
                            name: infoPerson.name,
                            lastName: infoPerson.last_name,
                            email: infoPerson.email,
                            avatar: infoPerson.avatar,
                            role: infoPerson.roles_idRoles,
                            username: data.username,
                        });
                        res.json({
                            ok: true,
                            message: `Le damos la bienvenida ${infoPerson.name} ${infoPerson.last_name}`,
                            token: tokenUser,
                        });
                    })
                } else {
                    res.json({
                        ok: false,
                        message: "Usuario/contraseña no son correctas",
                    });
                }
            }
        } else {
            res.json({
                ok: false,
                message: "Usuario/contraseña no son correctas",
            });
        }
    });
});


// Creación de usuario
userRoutes.post("/create", (req: Request, res: Response) => {
    const user = {
        name: req.body.name,
        last_name: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: bcryptjs.hashSync(req.body.password, 10),
        avatar: req.body.avatar,
        status: 1
    };

    let verifyEmail = `SELECT id FROM persons WHERE email = '${user.email}'`;
    con.query(verifyEmail, function (error, resQuery) {
        if (error) throw error;
        else {
            if (resQuery.length == 0) {
                con.query('ALTER TABLE users AUTO_INCREMENT = 1', function (err, result) {
                    if (err) throw err;
                });
                let sql = `INSERT INTO users (username, password, status) VALUES ('${user.username}', '${user.password}', ${user.status})`;
                con.query(sql, async function (err, result) {
                    if (err) {
                        if (err.errno == 1062) {
                            res.json({
                                ok: false,
                                message: `El username ${user.username} ya se encuentra registrado. Intente con otro`,
                            });
                        } else {
                            res.json({
                                ok: false,
                                error: err,
                            });
                        }
                    } else {
                        console.log("User inserted: " + result.insertId);
                        con.query('ALTER TABLE user_has_roles AUTO_INCREMENT = 1', function (err, result) {
                            if (err) throw err;
                        });
                        let sql = `INSERT INTO user_has_roles (user_id, roles_idRoles) VALUES (${result.insertId}, 2)`;
                        await con.query(sql, function (err, result) {
                            if (err) {
                                res.json({
                                    ok: false,
                                    error: err,
                                });
                                throw err;
                            } else {
                                console.log("Rol asignado con éxito");
                            }
                        });

                        con.query('ALTER TABLE persons AUTO_INCREMENT = 1', function (err, result) {
                            if (err) throw err;
                        });
                        let sqlPerson = `INSERT INTO persons (name, last_name, email, avatar, user_id) VALUES ('${user.name}', '${user.last_name}', '${user.email}', '${user.avatar}', ${result.insertId})`;
                        await con.query(sqlPerson, function (err, result) {
                            if (err) {
                                res.json({
                                    ok: false,
                                    error: err,
                                });
                                throw err;
                            } else {
                                console.log("Persona insertada con éxito");
                            }
                        });
                        res.json({
                            ok: true,
                            message: "Usuario registrado correctamente",
                        });
                    }
                });
            } else {
                res.json({
                    ok: false,
                    message: `El correo ${user.email} ya se encuentra registrado. Intente con otro`,
                });
            }
        }
    });
});


//Actualización de usuario
userRoutes.put("/update", verifyToken, (req: any, res: Response) => {
    const user = {
        name: req.body.name || req.user.name,
        lastName: req.body.lastname || req.user.lastName,
        email: req.body.email || req.user.email,
        avatar: req.body.avatar || req.user.avatar,
        username: req.body.username || req.user.username
    };

    let sql = `UPDATE users u, persons p 
    SET u.username='${user.username}', p.name ='${user.name}', p.last_name='${user.lastName}', email='${user.email}', avatar='${user.avatar}' 
    WHERE u.id=p.user_id AND u.username = '${req.user.username}' AND u.status=1`;

    con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: `No se pudo actualizar al usuario ${req.user.username}. Inténtelo de nuevo`,
            });
            throw err;
        }

        res.json({
            ok: true,
            message: "Usuario actualizado correctamente",
        });
    });
});


userRoutes.delete("/delete", verifyToken, (req: any, res: Response) => {
    let sql = `UPDATE users u INNER JOIN user_has_roles r ON r.user_id=u.id 
    SET u.status=0 
    WHERE u.username='${req.user.username}'`;
    con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: 'Ocurrió un error inesperado. Inténtelo de nuevo'
            });
        } else {
            if (result.length = 0) {
                res.json({
                    ok: false,
                    message: 'No tiene permiso para realizar esta acción'
                });
            } else {
                res.json({
                    ok: true,
                    message: 'Acaba de inactivar su cuenta :( ¡Esperamos su pronto regreso!'
                });
            }
        }
    })
});


// Inactivación superadmin de usuario
userRoutes.delete("/deleteSuper", verifyToken, (req: any, res: Response) => {
    let sql = `SELECT id from users u, user_has_roles r WHERE u.id = r.user_id AND username='${req.user.username}' AND r.roles_idRoles=1`;
    con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: 'Ocurrió un error inesperado. Inténtelo de nuevo'
            })
            throw err;
        } else {
            if (result.length == 0) {
                res.json({
                    ok: false,
                    message: 'No tiene los permisos suficientes para inactivar un usuario'
                })
            } else {
                let sqlInactivate = `UPDATE users SET status=0 WHERE username = '${req.body.username}'`;
                con.query(sqlInactivate, function (err, result) {
                    if (err) {
                        res.json({
                            ok: false,
                            message: 'Ocurrió un error inesperado. Inténtelo de nuevo'
                        })
                        throw err;
                    } else {
                        console.log(`El usuario ${req.body.username} ha sido inactivado`);
                        res.json({
                            ok: true,
                            message: `El usuario ${req.body.username} ha sido inactivado`
                        })
                    }
                })
            }
        }
    })
})


// Activación de usuario por superadmin
userRoutes.post("/activate", verifyToken, (req: any, res: Response) => {
    let sql = `SELECT id from users u, user_has_roles r WHERE u.id = r.user_id AND username='${req.user.username}' AND r.roles_idRoles=1`;
    con.query(sql, function (err, result) {
        if (err) {
            res.json({
                ok: false,
                message: 'Ocurrió un error inesperado. Inténtelo de nuevo'
            })
            throw err;
        } else {
            if (result.length == 0) {
                res.json({
                    ok: false,
                    message: 'No tiene los permisos suficientes para inactivar un usuario'
                })
            } else {
                let sqlInactivate = `UPDATE users SET status=1 WHERE username = '${req.body.username}'`;
                con.query(sqlInactivate, function (err, result) {
                    if (err) {
                        res.json({
                            ok: false,
                            message: 'Ocurrió un error inesperado. Inténtelo de nuevo'
                        })
                        throw err;
                    } else {
                        console.log(`El usuario ${req.body.username} ha sido activado correctamente`);
                        res.json({
                            ok: true,
                            message: `El usuario ${req.body.username} ha sido activado correctamente`
                        })
                    }
                })
            }
        }
    })
});


// Lista de usuarios
userRoutes.post("/list", verifyToken, (req, res)=>{
    let sql = `SELECT u.id, u.username, r.nameRoles, p.avatar FROM users u, user_has_roles ur, roles r, persons p WHERE u.id=ur.user_id AND ur.roles_idRoles=r.idRoles AND u.id=p.user_id`;
    con.query(sql, function(err,result){
        if(err){
            res.json({
                ok: false,
                message: 'Ocurrió un error inesperado, inténtelo de nuevo'
            })
            throw err;
        }else{
            res.json({
                ok:true,
                list: result
            })
        }
    })
});


//Usuario por id
userRoutes.get("/userById/:id", verifyToken, (req, res)=>{
    let sql = `SELECT u.username, 
    CASE WHEN u.status=0 THEN 'Inactivo' ELSE 'Activo' END AS status,
    p.name, p.last_name, p.email, p.avatar, r.nameRoles AS role
    FROM users u, user_has_roles ur, roles r, persons p 
    WHERE u.id=ur.user_id AND ur.roles_idRoles=r.idRoles AND u.id=p.user_id
    AND u.id=${req.params.id}`;
    con.query(sql, function(err, result){
        if(err){
            res.json({
                ok: false,
                message: 'Ocurrió un error inesperado, inténtelo de nuevo'
            })
            throw err;
        }else{
            if(result.length == 0){
                res.json({
                    ok: false,
                    message: 'El usuario consultado no se encuentra en el sistema'
                })
            }else{
                res.json({
                    ok: true,
                    user: result[0]
                })
            }
        }
    })
})

export default userRoutes;