const express = require("express");
const { engine } = require("express-handlebars");
const http = require("http");
const Container = require("./src/classes/container");
const { Server } = require("socket.io");
const router = require("./src/routes/index");

const app = express();

app.use(express.json());
app.use("/", router);
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.set("view engine", "hbs");
app.set("views", "./public/views");

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    layoutsDir: "./public/views/layouts",
    defaultLayout: "index",
    partialsDir: "./public/views/partials",
  }),
);

const db_products = new Container("./public/data/products.json");
const db_messages = new Container("./public/data/messages.json");

const io = new Server(server);

io.on("connection", (socket) => {
  db_products
    .getAll()
    .then((data) => socket.emit("products_list", data))
    .catch((err) => console.log(err));
  socket.on("post_product", (data) => {
    db_products.save(data).catch((err) => console.log(err));
    db_products
      .getAll()
      .then((data) => io.sockets.emit("products_list", data))
      .catch((err) => console.log(err));
  });

  db_messages
    .getAll()
    .then((data) => socket.emit("messages_list", data))
    .catch((err) => console.log(err));
  socket.on("post_message", (data) => {
    db_messages.save(data).then(
      db_messages
      .getAll()
      .then((data) => io.sockets.emit("messages_list", data))
      .catch((err) => console.log(err))
    ).catch((err) => console.log(err));
  });
});
