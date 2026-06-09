import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const port = 5000;

//parser
app.use(express.json());
// app.use(express.urlencoded()) // for form data

//DB
const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    phone VARCHAR(15), 
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `);

  await pool.query(`CREATE TABLE IF NOT EXISTS todos(
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT false,
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
};

initDB();

// logger middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method}`);
  next();
};

app.get("/", logger, (req: Request, res: Response) => {
  res.send("Next Level Programmer I am changing");
});

// users CRUD
app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,
      [name, email],
    );
    res.status(201).json({
      success: true,
      message: "Data is inserted",
    });
    // console.log(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// get all data
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    console.log(result);

    res.status(200).json({
      success: true,
      message: "Data getting successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// get single data
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Data retrieved successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// update single data
app.put("/users/:id", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, email= $2 WHERE id=$3 RETURNING *`,
      [name, email, req.params.id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Data updated successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// delete data
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [
      req.params.id,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Data not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Data deleted successfully",
        data: null,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// todos CRUD
app.post("/todos", async (req: Request, res: Response) => {
  const { user_id, title } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO todos(user_id, title) VALUES($1, $2) RETURNING *`,
      [user_id, title],
    );

    res.status(201).json({
      success: true,
      message: "Todo inserted successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// get all todos data
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    console.log(result);

    res.status(200).json({
      success: true,
      message: "Todos Data getting successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});

// Not found route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
