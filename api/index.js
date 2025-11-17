// Vercel Serverless Function Handler
module.exports = (req, res) => {
  // Teste simples primeiro
  if (req.url === '/' || req.url === '/api') {
    return res.json({ 
      status: 'online', 
      message: 'CuidaFast API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.url === '/health' || req.url === '/api/health') {
    return res.json({ ok: true, timestamp: new Date().toISOString() });
  }
  
  if (req.url === '/teste' || req.url === '/api/teste') {
    return res.json({ 
      ok: true, 
      mensagem: 'API funcionando corretamente!',
      timestamp: new Date().toISOString()
    });
  }
  
  // Se não encontrou a rota
  res.status(404).json({ 
    error: 'Rota não encontrada',
    url: req.url,
    method: req.method
  });
};
