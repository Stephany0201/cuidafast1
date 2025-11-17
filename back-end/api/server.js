
// server.js
const app = require('./index');
const PORT = process.env.PORT || 3000;

// Para desenvolvimento local
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
