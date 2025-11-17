// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');

const authRoutes = require('./routes/authRoutes');
const cadastroRoutes = require('./routes/cadastroRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const mensagemRoutes = require('./routes/mensagemRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

const app = express();

moment.tz.setDefault('America/Sao_Paulo');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/cadastro', cadastroRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/pagamento', pagamentoRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/notificacoes', notificationRoutes);
app.use('/api/tokens', tokenRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/teste', (req, res) => res.json({ ok: true, mensagem: 'API funcionando corretamente!' }));

// Listagem de rotas (seguro)
if (app._router && app._router.stack) {
  console.log('=== ROTAS REGISTRADAS ===');
  app._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ');
      console.log(`${methods} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach((fn) => {
        if (fn.route && fn.route.path) {
          const methods = Object.keys(fn.route.methods).map(m => m.toUpperCase()).join(', ');
          console.log(`${methods} ${fn.route.path}`);
        }
      });
    }
  });
  console.log('=== FIM DAS ROTAS ===');
} else {
  console.log('Nenhum router encontrado em app._router.stack');
}

module.exports = app;
