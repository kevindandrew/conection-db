import expres from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import type { Request, Response } from "express";
import { totalmem } from "node:os";
import { json } from "node:stream/consumers";
dotenv.config();
const app = expres();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(expres.json());

// PROBANDO CONEXCION A LA BASE DE DATOS
app.get("/productos", async function (req: Request, res: Response) {
  try {
    const result = await pool.query("SELECT * FROM productos;");
    res.json({
      message: "Conexion exitosa a la base de datos :D",
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("error al consultar PostgreSQL: ");
    res.status(500).json({
      message: "error al intentar conectar a la base de datos :c",
    });
  }
});
/* el metodo get productos por el id  */
app.get("/productos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "EL ID DEBE SER UN VALOR NUMERICO" });
    }
    const resu = await pool.query("SELECT * FROM productos WHERE id =$1", [id]);
    if (resu.rows.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(resu.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/productos", async (req: Request, res: Response) => {
  try {
    const { nombre, precio, categoria } = req.body;
    if (!nombre || !categoria || !precio) {
      res.status(400).json({ error: "faltan datos obligatorios" });
    }
    const query =
      "INSERT INTO productos (nombre , precio , categoria) VALUES ($1,$2,$3) RETURNING *;";
    const result = await pool.query(query, [nombre, precio, categoria]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/productos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "EL ID DEBE SER UN VALOR NUMERICO" });
    }
    const resu = await pool.query("SELECT * FROM productos WHERE id =$1", [id]);
    if (resu.rows.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    const { nombre, precio, categoria } = req.body;
    if (!nombre || !precio || !categoria) {
      res.status(400).json({ error: "faltan datos obligatorios" });
    }
    const query = `UPDATE productos
            SET nombre = $1,
            categoria = $2,
            precio = $3
            WHERE id = $4
            RETURNING *;
`;
    const result = await pool.query(query, [nombre, categoria, precio, id]);
    res.status(202).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/productos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "EL ID DEBE SER UN VALOR NUMERICO" });
    }
    const resu = await pool.query("DELETE FROM productos WHERE id = $1;", [id]);
    res.status(200).json({ message: "producto eliminado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", function (req: Request, res: Response) {
  res.json({
    message: "servidor corriendo exitosamente",
  });
});
app.listen(PORT, async function () {
  console.log("servidor corriendo en http://localhost" + PORT);
  try {
    const res = await pool.query("SELECT NOW()");
    console.log(
      `CONECTADO A POSTGRESQL CON EXITO HORA DEL SERVIDOR ${res.rows[0].now}`,
    );
  } catch (error) {
    console.log("ERROR EN LA CONEXION");
  }
});
