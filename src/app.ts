import express, { Request, Response } from "express";
import initDB from "./config/db";
import logger from "./middleware/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { todoRoutes } from "./modules/todo/todo.routes";
import { userRoutes } from "./modules/user/user.routes";

const app = express();

//parser
app.use(express.json());
// app.use(express.urlencoded()) // for form data

// initializing DB
initDB();

app.get("/", logger, (req: Request, res: Response) => {
  res.send("Next Level Programmer I am changing");
});

// users CRUD
app.use("/users", userRoutes);

// todos CRUD
app.use("/todos", todoRoutes);

// auth CRUD
app.use("/auth", authRoutes);

// Not found route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
