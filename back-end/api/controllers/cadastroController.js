// Espera: POST { email, nome, foto_url, tipo_usuario }
// Retorna: 201 user criado / 200 user atualizado

import UsuarioModel from '../models/UsuarioModel.js';
import ClienteModel from '../models/ClienteModel.js';
import CuidadorModel from '../models/CuidadorModel.js';

export const loginGoogle = async (req, res) => {
  try {
    const { email, nome, foto_url, tipo_usuario } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email obrigatório' });
    }

    // valida tipo
    const tipo = tipo_usuario === 'cuidador' ? 'cuidador' : 'cliente';

    // busca por email
    let usuario = await UsuarioModel.findByEmail(email);

    if (!usuario) {
      // cria usuário simplificado no DB
      const userId = await UsuarioModel.create({
        nome: nome || email.split('@')[0],
        email,
        senha: null,
        telefone: null,
        data_nascimento: null,
        photo_url: foto_url || null,
        auth_uid: null,
        tipo
      });

      usuario = await UsuarioModel.getById(userId);

      // cria registros complementares conforme tipo
      if (tipo === 'cliente') {
        await ClienteModel.create({ usuario_id: userId });
      } else if (tipo === 'cuidador') {
        await CuidadorModel.create({ usuario_id: userId });
      }

      delete usuario.senha;
      return res.status(201).json({
        message: 'Usuário criado via Google',
        user: usuario
      });
    }

    // se já existe, atualiza possível foto/tipo
    await UsuarioModel.updateGoogleData(usuario.id, {
      photo_url: foto_url || usuario.photo_url,
      tipo
    });

    usuario = await UsuarioModel.getById(usuario.id);
    delete usuario.senha;

    // atualiza último login (se você tiver função)
    if (UsuarioModel.setLastLogin) {
      await UsuarioModel.setLastLogin(usuario.id);
    }

    return res.status(200).json({
      message: 'Usuário existente atualizado',
      user: usuario
    });

  } catch (err) {
    console.error('cadastroController.loginGoogle error', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export default {
  loginGoogle
};
