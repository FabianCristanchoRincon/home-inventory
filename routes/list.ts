import { Request, Response, Router } from "express";
import { verifyToken } from "../middlewares/authentication";
import { con } from "../classes/connection";

const listRoutes = Router();

//Creación de lista
listRoutes.post("/create", verifyToken, (req: any, res: Response) => {
  con.query("ALTER TABLE lists AUTO_INCREMENT = 1", function (err, result) {
    if (err) throw err;
  });

  const list = {
    name: req.body.name,
    description: req.body.description || "",
    type: req.body.type || 1,
    user_id: req.user.id,
  };

  let sql = `INSERT INTO lists (name, description, type, user_id) VALUES ('${list.name}', '${list.description}', ${list.type}, ${list.user_id})`;
  con.query(sql, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      res.json({
        ok: true,
        id: result.insertId,
        message: "Lista creada con éxito",
      });
    }
  });
});

//Edicion de lista
listRoutes.put("/update", verifyToken, (req, res) => {
  const list = {
    id: req.body.id,
    name: req.body.name,
    description: req.body.description || "",
    type: req.body.type || 1,
  };

  let sql = `UPDATE lists SET name='${list.name}', description='${list.description}', type=${list.type}
    WHERE id=${list.id}`;

  con.query(sql, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      if (result.affectedRows == 0) {
        res.json({
          ok: false,
          message: "No se encontró una lista apropiada para hacer el cambio",
        });
      } else {
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
listRoutes.get("/activeLists", verifyToken, (req: any, res: Response) => {
  let sql = `SELECT id, name, description FROM lists WHERE user_id=${req.user.id} AND type=1`;
  con.query(sql, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      if (result.length == 0) {
        res.json({
          ok: false,
          message: "No tiene listas pendientes",
        });
      } else {
        res.json({
          ok: true,
          lists: result,
        });
      }
    }
  });
});

//Show inactive lists
listRoutes.get("/inactiveLists", verifyToken, (req: any, res: Response) => {
  let sql = `SELECT id, name FROM lists WHERE user_id=${req.user.id} AND type=0`;
  con.query(sql, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      if (result.length == 0) {
        res.json({
          ok: false,
          message: "No tiene listas terminadas",
        });
      } else {
        res.json({
          ok: true,
          lists: result,
        });
      }
    }
  });
});

//Show list by id
listRoutes.get("/listById/:id", verifyToken, (req: any, res: Response) => {
  let resultList = {
    id: String,
    name: String,
    description: String,
    products: [],
  };

  let listInfo = `SELECT id, name, description FROM lists
    WHERE id=${req.params.id}`;
  con.query(listInfo, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      if (result.length != 0) {
          resultList["id"] = result[0].id;
        resultList["name"] = result[0].name;
        resultList["description"] = result[0].description;
      }
    }
  });

  let sql = `SELECT p.id, p.name FROM lists l, list_has_products lp, products p
    WHERE l.id=lp.list_id AND lp.product_id=p.id AND l.id=${req.params.id}`;
  con.query(sql, function (err, result) {
    if (err) {
      res.json({
        ok: false,
        message: "Ocurrió un error inesperado. Inténtelo de nuevo",
      });
      throw err;
    } else {
      resultList["products"] = result;
      res.json({
        ok: true,
        resultList,
      });
    }
  });
});

listRoutes.post("/delete", verifyToken, (req: any, res: Response) => {
  let query = `SELECT lp.id FROM lists l, list_has_products lp 
    WHERE l.id=lp.list_id
    AND l.id = ${req.body.id}`;

  con.query(query, async function (err, result) {
    if (err) throw err;

    for await (const item of result) {
      let queryDelete = `DELETE FROM list_has_products WHERE id = ${item.id}`;
      con.query(queryDelete, function (error, resp) {
        if (error) throw error;

        console.log("Registro de lista borrado");
      });
    }

    let sql = `DELETE FROM lists WHERE id = ${req.body.id}`;
    con.query(sql, function (err, resul) {
      if (err) throw err;

      res.json({
        ok: true,
        message: 'Lista borrada con éxito',
      });
    });
  });
});

export default listRoutes;
