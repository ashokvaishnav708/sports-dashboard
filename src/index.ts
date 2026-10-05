import expres from "express";

const app = expres();

const port = 8000;

app.use(expres.json());

app.get("/", (req, res) => {
  res.send("Hello from Express server!");
});

app.listen(port, () => {
  console.log(`Server is running at localhost: ${port}`);
});
