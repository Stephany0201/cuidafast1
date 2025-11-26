const pool = require('./db');

async function getDashboardData() {
    try {
        const dashboard = {};

        const totalConsultas = await pool.query(
            `SELECT COUNT(*) AS total_consultas FROM contratar`
        );
        dashboard.totalConsultas = totalConsultas.rows[0].total_consultas;

        const valorArrecadado = await pool.query(
            `SELECT COALESCE(SUM(cuidador.ganhos),0) AS total_valor FROM cuidador`
        );
        dashboard.valorArrecadado = valorArrecadado.rows[0].total_valor;

        const usuariosAtendidos = await pool.query(
            `SELECT COUNT(DISTINCT cliente_id) AS total_usuarios
             FROM contratar
             WHERE EXTRACT(MONTH FROM data_criacao) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM data_criacao) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );
        dashboard.usuariosAtendidos = usuariosAtendidos.rows[0].total_usuarios;

        const avaliacaoMedia = await pool.query(
            `SELECT COALESCE(AVG(avaliacao),0) AS media_avaliacao FROM cuidador`
        );
        dashboard.avaliacaoMedia = avaliacaoMedia.rows[0].media_avaliacao;

        const atividadeConsultas = await pool.query(
            `SELECT DATE(data_criacao) AS dia, COUNT(*) AS total
             FROM contratar
             WHERE data_criacao >= CURRENT_DATE - INTERVAL '30 days'
             GROUP BY DATE(data_criacao)
             ORDER BY dia ASC`
        );
        dashboard.atividadeConsultas = atividadeConsultas.rows;

        const performanceMensal = await pool.query(
            `SELECT TO_CHAR(data_criacao, 'YYYY-MM') AS mes,
                    COUNT(*) AS total_consultas,
                    SUM(cuidador.ganhos) AS receita
             FROM contratar
             JOIN cuidador ON contratar.cuidador_id = cuidador.usuario_id
             WHERE data_criacao >= CURRENT_DATE - INTERVAL '6 months'
             GROUP BY mes
             ORDER BY mes ASC`
        );
        dashboard.performanceMensal = performanceMensal.rows;

        const distribuicaoServico = await pool.query(
            `SELECT tipos_cuidado, COUNT(*) AS total
             FROM cuidador
             GROUP BY tipos_cuidado`
        );
        dashboard.distribuicaoServico = distribuicaoServico.rows;

        const historicoPagamento = await pool.query(
            `SELECT c.id AS contrato_id, cl.usuario_id AS cliente_id, cu.usuario_id AS cuidador_id,
                    c.tipo_contratacao, c.data_inicio, c.data_fim, cu.ganhos AS valor, c.status
             FROM contratar c
             JOIN cliente cl ON c.cliente_id = cl.usuario_id
             JOIN cuidador cu ON c.cuidador_id = cu.usuario_id
             ORDER BY c.data_criacao DESC LIMIT 50`
        );
        dashboard.historicoPagamento = historicoPagamento.rows;

        const taxaConversao = await pool.query(
            `SELECT 
                ROUND(
                    100 * (COUNT(DISTINCT cliente_id)::numeric / (SELECT COUNT(*) FROM usuario)), 2
                ) AS taxa_conversao
             FROM contratar`
        );
        dashboard.taxaConversao = taxaConversao.rows[0].taxa_conversao;

        const tempoMedioResposta = await pool.query(
            `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (
                     (SELECT MIN(m2.data_envio)
                      FROM mensagem m2
                      WHERE m2.remetente_id = m1.destinatario_id
                        AND m2.destinatario_id = m1.remetente_id
                        AND m2.data_envio > m1.data_envio
                     ) - m1.data_envio
                   )) / 60),0) AS tempo_medio_minutos
             FROM mensagem m1`
        );
        dashboard.tempoMedioResposta = tempoMedioResposta.rows[0].tempo_medio_minutos;

        const clientesRecorrentes = await pool.query(
            `SELECT ROUND(100 * (SUM(c)::numeric / COUNT(*)), 2) AS perc_recorrentes
             FROM (
                 SELECT cliente_id, COUNT(*) AS c
                 FROM contratar
                 GROUP BY cliente_id
                 HAVING COUNT(*) > 1
             ) AS sub`
        );
        dashboard.clientesRecorrentes = clientesRecorrentes.rows[0].perc_recorrentes;

        const receitaPorHora = await pool.query(
            `SELECT COALESCE(SUM(cu.valor_hora),0) AS total_receita
             FROM contratar ct
             JOIN cuidador cu ON ct.cuidador_id = cu.usuario_id`
        );
        dashboard.receitaPorHora = receitaPorHora.rows[0].total_receita;

        return dashboard;

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        throw error;
    }
}

module.exports = { getDashboardData };

