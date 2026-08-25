import { pool } from "../config/db.js";
import type { Request, Response } from "express";

export async function getProducts(req: Request, res: Response) {
  try {
    const result = await pool.query("SELECT * FROM productos;");
    console.log(result);
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
}

export async function getProductsById(req: Request, res: Response) {
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
}

export async function postProduct(req: Request, res: Response) {
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
}

export async function putProduct(req: Request, res: Response) {
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
}

export async function deleteProducts(req: Request, res: Response) {
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
}
