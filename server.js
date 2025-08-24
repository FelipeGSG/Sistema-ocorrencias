const express = require('express');
const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');

const app = express();
const porta = 3000;

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // pasta uploads
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middlewares padrão
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
})

app.use(express.json());

// Rotas próprias
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/api/upload", upload.array("evidencias"), (req, res) => {
  console.log("Arquivos recebidos:", req.files.map(f => f.originalname));
  // res.send("Upload concluído!");
  const nameFiles = req.files.map(f => f.filename)
  res.send({status: 200, files: nameFiles})
});

// Integra o json-server como middleware
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
app.use(middlewares);
app.use(router);

// Inicia o servidor
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
