import { error } from "node:console";
import { ProductModel, type Producto } from "../models/product.model.js";

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
};
