
const express = require("express");
const { loginGoogle, cadastrarUsuario } = require("../controllers/cadastroController");

const router = express.Router();

router.post("/login/google", loginGoogle);
router.post("/cadastro", cadastrarUsuario);

module.exports = router;

