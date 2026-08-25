import expres from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import type { Request, Response } from "express";
import productsRouter from "./routes/product.routes.js";
dotenv.config();
const app = expres();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(expres.json());

app.use("/productos", productsRouter);

app.get("/", function (req: Request, res: Response) {
  res.json({
    message: "servidor corriendo exitosamente",
  });
});
app.listen(PORT, async function () {
  console.log("servidor corriendo en http://localhost:" + PORT);
  try {
    const res = await pool.query("SELECT NOW()");
    console.log(
      `CONECTADO A POSTGRESQL CON EXITO HORA DEL SERVIDOR ${res.rows[0].now}`,
    );
  } catch (error) {
    console.log("ERROR EN LA CONEXION");
  }
});
