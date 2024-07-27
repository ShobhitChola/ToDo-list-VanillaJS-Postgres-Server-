import express from "express";
import { format } from 'date-fns';
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "Guerlain@123",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
]; 

app.get("/", async(req, res) => {
  const today = new Date();
  const formattedDate = format(today, 'MMMM do, yyyy');
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      date: formattedDate
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  // items.push({ title: item });
  try {
    await db.query("INSERT INTO items(title) VALUES ($1);", [item])
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = ($2);", [title,id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1 ;", [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
