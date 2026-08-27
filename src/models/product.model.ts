import type { z } from "zod";
import { pool } from "../config/db.js";
import type { updateProductoSchema } from "../schemas/product.schema.js";

//TIPADO DE LA TABLA
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}
// apartir de el tipado crear otros types
export type CreateProductoInput = Omit<Producto, "id">;
export type UpdateProductoInput = z.infer<typeof updateProductoSchema>;

//FUNCIONES Q CONSULTAN A LA BASE DE DATOS
export const ProductModel = {
  findAll: async (): Promise<Producto[]> => {
    const { rows } = await pool.query(
      "SELECT * FROM productos ORDER BY id ASC;",
    );
    return rows;
  },
  findById: async (id: number): Promise<Producto | null> => {
    const { rows } = await pool.query(
      "SELECT * FROM productos WHERE id = $1;",
      [id],
    );
    return rows[0] || null;
  },
  create: async (dato: CreateProductoInput): Promise<Producto> => {
    const { nombre, categoria, precio } = dato;
    const query =
      "INSERT INTO productos (nombre , precio , categoria) VALUES ($1,$2,$3) RETURNING *;";
    const { rows } = await pool.query(query, [nombre, precio, categoria]);
    return rows[0];
  },
  update: async (
    id: number,
    dato: UpdateProductoInput,
  ): Promise<Producto | null> => {
    const campos = Object.keys(dato) as (keyof UpdateProductoInput)[];

    const setClause = campos
      .map((campo, i) => `${campo} = $${i + 1}`)
      .join(", ");
    const valores = campos.map((campo) => dato[campo]);

    const { rows } = await pool.query(
      `UPDATE productos
            SET ${setClause}
            WHERE id = $${campos.length + 1}
            RETURNING *;
`,
      [...valores, id],
    );
    return rows[0] || null;
  },
  delete: async (id: number): Promise<boolean> => {
    const { rowCount } = await pool.query(
      "DELETE FROM productos WHERE id = $1;",
      [id],
    );
    return (rowCount ?? 0) > 0;
  },
};
