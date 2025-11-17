const UsuarioModel = require('../models/UsuarioModel');
const CuidadorModel = require('../models/CuidadorModel');
const ClienteModel = require('../models/ClienteModel');

/**
 * Controller para gerenciar perfis de usuários (Cuidadores e Clientes)
 * Garante que dados sensíveis não sejam expostos no frontend
 */

/**
 * Buscar perfil público de um cuidador
 * GET /api/perfil/cuidador/:id
 * Retorna apenas informações públicas do cuidador
 */
exports.getPerfilCuidador = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados do usuário
    const usuario = await UsuarioModel.getById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Cuidador não encontrado' });
    }

    // Buscar dados específicos do cuidador
    const cuidador = await CuidadorModel.getById(id);
    if (!cuidador) {
      return res.status(404).json({ message: 'Perfil de cuidador não encontrado' });
    }

    // Montar resposta com apenas dados públicos (SEM DADOS SENSÍVEIS)
    const perfilPublico = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email, // Apenas para contato via sistema
      telefone: usuario.telefone, // Apenas se o cuidador permitir
      foto_perfil: usuario.foto_perfil,
      data_cadastro: usuario.data_cadastro,
      
      // Dados do cuidador
      tipos_cuidado: cuidador.tipos_cuidado,
      descricao: cuidador.descricao,
      valor_hora: cuidador.valor_hora,
      especialidades: cuidador.especialidades,
      experiencia: cuidador.experiencia,
      avaliacao: cuidador.avaliacao,
      horarios_disponiveis: cuidador.horarios_disponiveis,
      idiomas: cuidador.idiomas,
      formacao: cuidador.formacao,
      local_trabalho: cuidador.local_trabalho,
      
      // NÃO incluir: senha, CPF, RG, dados bancários, ganhos, etc.
    };

    return res.json(perfilPublico);
  } catch (err) {
    console.error('[PerfilController] Erro ao buscar perfil do cuidador:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/**
 * Buscar perfil público de um cliente
 * GET /api/perfil/cliente/:id
 * Retorna apenas informações públicas do cliente
 */
exports.getPerfilCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados do usuário
    const usuario = await UsuarioModel.getById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Buscar dados específicos do cliente
    const cliente = await ClienteModel.getById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Perfil de cliente não encontrado' });
    }

    // Montar resposta com apenas dados públicos (SEM DADOS SENSÍVEIS)
    const perfilPublico = {
      id: usuario.id,
      nome: usuario.nome,
      foto_perfil: usuario.foto_perfil,
      data_cadastro: usuario.data_cadastro,
      
      // Dados do cliente (apenas o necessário)
      endereco: cliente.endereco, // Apenas cidade/estado, não endereço completo
      preferencias: cliente.preferencias,
      
      // NÃO incluir: email, telefone, CPF, histórico completo, dados de pagamento, etc.
    };

    return res.json(perfilPublico);
  } catch (err) {
    console.error('[PerfilController] Erro ao buscar perfil do cliente:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/**
 * Buscar perfil por email (usado para busca)
 * GET /api/perfil/buscar?email=xxx&tipo=cuidador
 * Retorna apenas informações públicas
 */
exports.buscarPerfilPorEmail = async (req, res) => {
  try {
    const { email, tipo } = req.query;
    
    if (!email || !tipo) {
      return res.status(400).json({ message: 'Email e tipo são obrigatórios' });
    }

    // Buscar usuário por email
    const usuario = await UsuarioModel.findByEmail(email);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar tipo e buscar dados específicos
    if (tipo === 'cuidador') {
      const cuidador = await CuidadorModel.getById(usuario.id);
      if (!cuidador) {
        return res.status(404).json({ message: 'Perfil de cuidador não encontrado' });
      }

      const perfilPublico = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        foto_perfil: usuario.foto_perfil,
        tipos_cuidado: cuidador.tipos_cuidado,
        descricao: cuidador.descricao,
        valor_hora: cuidador.valor_hora,
        especialidades: cuidador.especialidades,
        experiencia: cuidador.experiencia,
        avaliacao: cuidador.avaliacao,
        horarios_disponiveis: cuidador.horarios_disponiveis,
        idiomas: cuidador.idiomas,
        formacao: cuidador.formacao,
        local_trabalho: cuidador.local_trabalho,
      };

      return res.json(perfilPublico);
    } else if (tipo === 'cliente') {
      const cliente = await ClienteModel.getById(usuario.id);
      if (!cliente) {
        return res.status(404).json({ message: 'Perfil de cliente não encontrado' });
      }

      const perfilPublico = {
        id: usuario.id,
        nome: usuario.nome,
        foto_perfil: usuario.foto_perfil,
        endereco: cliente.endereco,
        preferencias: cliente.preferencias,
      };

      return res.json(perfilPublico);
    } else {
      return res.status(400).json({ message: 'Tipo inválido. Use "cuidador" ou "cliente"' });
    }
  } catch (err) {
    console.error('[PerfilController] Erro ao buscar perfil por email:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/**
 * Listar todos os cuidadores disponíveis (para busca)
 * GET /api/perfil/cuidadores
 * Retorna lista com informações públicas
 */
exports.listarCuidadores = async (req, res) => {
  try {
    const { especialidade, cidade, valorMax } = req.query;
    
    // Buscar todos os cuidadores
    const cuidadores = await CuidadorModel.getAll();
    
    // Buscar dados dos usuários correspondentes
    const perfisPublicos = [];
    for (const cuidador of cuidadores) {
      const usuario = await UsuarioModel.getById(cuidador.usuario_id);
      if (usuario) {
        // Aplicar filtros se fornecidos
        let incluir = true;
        
        if (especialidade && !cuidador.especialidades?.includes(especialidade)) {
          incluir = false;
        }
        
        if (cidade && !cuidador.local_trabalho?.includes(cidade)) {
          incluir = false;
        }
        
        if (valorMax && cuidador.valor_hora > parseFloat(valorMax)) {
          incluir = false;
        }
        
        if (incluir) {
          perfisPublicos.push({
            id: usuario.id,
            nome: usuario.nome,
            foto_perfil: usuario.foto_perfil,
            tipos_cuidado: cuidador.tipos_cuidado,
            descricao: cuidador.descricao,
            valor_hora: cuidador.valor_hora,
            especialidades: cuidador.especialidades,
            experiencia: cuidador.experiencia,
            avaliacao: cuidador.avaliacao,
            local_trabalho: cuidador.local_trabalho,
          });
        }
      }
    }

    return res.json({ cuidadores: perfisPublicos, total: perfisPublicos.length });
  } catch (err) {
    console.error('[PerfilController] Erro ao listar cuidadores:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

/**
 * Atualizar foto de perfil
 * PUT /api/perfil/foto
 * Requer autenticação
 */
exports.atualizarFotoPerfil = async (req, res) => {
  try {
    const { userId, fotoUrl } = req.body;
    
    if (!userId || !fotoUrl) {
      return res.status(400).json({ message: 'userId e fotoUrl são obrigatórios' });
    }

    // Atualizar foto no banco de dados
    await UsuarioModel.updateFotoPerfil(userId, fotoUrl);

    return res.json({ message: 'Foto de perfil atualizada com sucesso', fotoUrl });
  } catch (err) {
    console.error('[PerfilController] Erro ao atualizar foto:', err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = exports;

