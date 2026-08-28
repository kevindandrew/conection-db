import { ProductModel } from "../models/product.model.js";
import type { productQueryParams } from "../schemas/product.schema.js";
import type { paginaResult, Producto } from "../models/product.model.js";

export const productService = {
  createProduct: async function (
    nombre: string,
    precio: number,
    categoria: string,
  ): Promise<Producto> {
    // limpiar espacios vacios al final e inicio del nombre y categoria
    const cleanName = nombre.trim();
    const cleanCategory = categoria.trim();

    //evitar q existan 2 productos q tengan el mismo nombre
    const prodcutExist = await ProductModel.findByName(nombre);
    if (prodcutExist) {
      throw new Error("EL PRODUCTO YA EXISTE!!!");
    }
    return await ProductModel.create({ nombre, precio, categoria });
  },
  getProductsFilters: async (
    query: productQueryParams,
  ): Promise<paginaResult<Producto>> => {
    let page = 1;
    let limit = 10;
    if (query.page) {
      page = Number(query.page);
    }
    if (query.limit) {
      limit = Number(query.limit);
    }
    const search = query.search?.trim();
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

    return await ProductModel.findWhitFilter(
      page,
      limit,
      search,
      minPrice,
      maxPrice,
    );
  },
};
