import type { z } from "zod";
import { pool } from "../config/db.js";
import type { updateProductoSchema } from "../schemas/product.schema.js";
import { pathToFileURL } from "node:url";

//TIPADO DE LA TABLA
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface paginaResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  findByName: async (name: string): Promise<Producto | null> => {
    const { rows } = await pool.query<Producto>(
      "SELECT * FROM productos WHERE LOWER(nombre) = LOWER($1);",
      [name],
    );
    return rows[0] || null;
  },
  findWhitFilter: async (
    page: number = 1,
    limit: number = 10,
    search?: string, // where name ILIKE %${search}%
    minPrice?: number, // where precio >= ${minPirce}
    maxPrice?: number, // where precio <= ${maxPrice}
  ): Promise<paginaResult<Producto>> => {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    //la construccion de las condiciones
    if (search) {
      conditions.push(`nombre ILIKE $${paramIndex}`);
      paramIndex++;
      values.push(`%${search}%`);
    }

    if (minPrice !== undefined) {
      conditions.push(`precio >= $${paramIndex}`);
      paramIndex++;
      values.push(minPrice);
    }
    if (maxPrice !== undefined) {
      conditions.push(`precio <= ${maxPrice}`);
      paramIndex++;
      values.push(maxPrice);
    }
    // unir las condiciones existentes con AND
    const whereUnited =
      conditions.length > 0 ? `WHERE ${conditions.join(` AND `)}` : "";
    //CONTEO TOTAL de prodcutos q coinciden con los filtros aplicados (en caso de haberlos)
    const countQuery = `SELECT COUNT(*) FROM productos ${whereUnited}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].count);
    //consulta de datos con limit y offset
    const offset = (page - 1) * limit;
    //agregar el limit y offset a los placeholder dinamicos
    const dataValues = [...values, limit, offset];
    const dataQuery = `
    SELECT * FROM productos
    ${whereUnited}
    ORDER BY id ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const { rows } = await pool.query(dataQuery, dataValues);

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },
};
