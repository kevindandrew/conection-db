import { z } from "zod";

export const createProductoSchema = z.object({
  nombre: z
    .string({
      message: "El nombre debe ser obligatorio",
    })
    .min(3, "el nombre debe tener almenos 3 caracteres")
    .trim()
    .min(1),
  precio: z
    .number({
      message: "El precio debe ser obligatorio",
    })
    .positive("el precio debe ser mayor a 0"),
  categoria: z
    .string({
      message: "la categoria debe ser obligatorio",
    })
    .min(3, "la categoria debe tener almenos 3 caracteres")
    .trim()
    .min(1),
});

export interface productQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
}

export const updateProductoSchema = createProductoSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });
