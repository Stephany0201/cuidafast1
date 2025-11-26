<<<<<<< HEAD
const supabase = require('./db');
=======
const pool = require('./db');
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f

async function getDashboardData() {
    try {
        const dashboard = {};

<<<<<<< HEAD
        // Total de consultas
        const { count: totalConsultas, error: err1 } = await supabase
            .from('contratar')
            .select('*', { count: 'exact', head: true });
        if (err1) throw err1;
        dashboard.totalConsultas = totalConsultas || 0;

        // Valor arrecadado (soma de ganhos dos cuidadores)
        const { data: cuidadores, error: err2 } = await supabase
            .from('cuidador')
            .select('ganhos');
        if (err2) throw err2;
        dashboard.valorArrecadado = cuidadores?.reduce((sum, c) => sum + (parseFloat(c.ganhos) || 0), 0) || 0;

        // Usuários atendidos no mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: contratosMes, error: err3 } = await supabase
            .from('contratar')
            .select('cliente_id')
            .gte('data_criacao', startOfMonth);
        if (err3) throw err3;
        const uniqueClientes = new Set(contratosMes?.map(c => c.cliente_id) || []);
        dashboard.usuariosAtendidos = uniqueClientes.size;

        // Avaliação média
        const { data: avaliacoes, error: err4 } = await supabase
            .from('cuidador')
            .select('avaliacao');
        if (err4) throw err4;
        const avaliacoesValidas = avaliacoes?.filter(a => a.avaliacao != null).map(a => parseFloat(a.avaliacao)) || [];
        dashboard.avaliacaoMedia = avaliacoesValidas.length > 0 
            ? avaliacoesValidas.reduce((sum, a) => sum + a, 0) / avaliacoesValidas.length 
            : 0;

        // Atividade consultas (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: atividadeData, error: err5 } = await supabase
            .from('contratar')
            .select('data_criacao')
            .gte('data_criacao', thirtyDaysAgo.toISOString());
        if (err5) throw err5;
        
        const atividadePorDia = {};
        atividadeData?.forEach(item => {
            const date = new Date(item.data_criacao).toISOString().split('T')[0];
            atividadePorDia[date] = (atividadePorDia[date] || 0) + 1;
        });
        dashboard.atividadeConsultas = Object.entries(atividadePorDia)
            .map(([dia, total]) => ({ dia, total }))
            .sort((a, b) => a.dia.localeCompare(b.dia));

        // Performance mensal (últimos 6 meses) - precisa de RPC ou query manual
        // Por enquanto, vamos fazer uma versão simplificada
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const { data: contratos6Meses, error: err6 } = await supabase
            .from('contratar')
            .select('data_criacao, cuidador_id')
            .gte('data_criacao', sixMonthsAgo.toISOString());
        if (err6) throw err6;

        const { data: todosCuidadores, error: err6b } = await supabase
            .from('cuidador')
            .select('usuario_id, ganhos');
        if (err6b) throw err6b;
        const ganhosMap = {};
        todosCuidadores?.forEach(c => {
            ganhosMap[c.usuario_id] = parseFloat(c.ganhos) || 0;
        });

        const performancePorMes = {};
        contratos6Meses?.forEach(ct => {
            const mes = new Date(ct.data_criacao).toISOString().substring(0, 7);
            if (!performancePorMes[mes]) {
                performancePorMes[mes] = { total_consultas: 0, receita: 0 };
            }
            performancePorMes[mes].total_consultas++;
            performancePorMes[mes].receita += ganhosMap[ct.cuidador_id] || 0;
        });
        dashboard.performanceMensal = Object.entries(performancePorMes)
            .map(([mes, dados]) => ({ mes, ...dados }))
            .sort((a, b) => a.mes.localeCompare(b.mes));

        // Distribuição de serviço
        const { data: tiposCuidado, error: err7 } = await supabase
            .from('cuidador')
            .select('tipos_cuidado');
        if (err7) throw err7;
        const distribuicao = {};
        tiposCuidado?.forEach(c => {
            const tipo = c.tipos_cuidado;
            distribuicao[tipo] = (distribuicao[tipo] || 0) + 1;
        });
        dashboard.distribuicaoServico = Object.entries(distribuicao)
            .map(([tipos_cuidado, total]) => ({ tipos_cuidado, total }));

        // Histórico de pagamento (últimos 50)
        const { data: historico, error: err8 } = await supabase
            .from('contratar')
            .select('id, cliente_id, cuidador_id, tipo_contratacao, data_inicio, data_fim, status, data_criacao')
            .order('data_criacao', { ascending: false })
            .limit(50);
        if (err8) throw err8;

        // Buscar dados dos cuidadores para pegar ganhos
        const cuidadorIds = [...new Set(historico?.map(h => h.cuidador_id).filter(Boolean) || [])];
        const { data: cuidadoresHist, error: err8b } = await supabase
            .from('cuidador')
            .select('usuario_id, ganhos')
            .in('usuario_id', cuidadorIds);
        if (err8b) throw err8b;
        const ganhosMapHist = {};
        cuidadoresHist?.forEach(c => {
            ganhosMapHist[c.usuario_id] = parseFloat(c.ganhos) || 0;
        });

        dashboard.historicoPagamento = historico?.map(h => ({
            contrato_id: h.id,
            cliente_id: h.cliente_id,
            cuidador_id: h.cuidador_id,
            tipo_contratacao: h.tipo_contratacao,
            data_inicio: h.data_inicio,
            data_fim: h.data_fim,
            valor: ganhosMapHist[h.cuidador_id] || 0,
            status: h.status
        })) || [];

        // Taxa de conversão
        const { count: totalUsuarios, error: err9 } = await supabase
            .from('usuario')
            .select('*', { count: 'exact', head: true });
        if (err9) throw err9;
        const { data: clientesContrataram, error: err9b } = await supabase
            .from('contratar')
            .select('cliente_id');
        if (err9b) throw err9b;
        const uniqueClientesContrataram = new Set(clientesContrataram?.map(c => c.cliente_id) || []);
        dashboard.taxaConversao = totalUsuarios > 0 
            ? Math.round((uniqueClientesContrataram.size / totalUsuarios) * 100 * 100) / 100 
            : 0;

        // Tempo médio de resposta (query complexa - simplificada)
        // Esta query é muito complexa, pode precisar de RPC no Supabase
        dashboard.tempoMedioResposta = 0; // TODO: Implementar com RPC se necessário

        // Clientes recorrentes
        const { data: contratosPorCliente, error: err10 } = await supabase
            .from('contratar')
            .select('cliente_id');
        if (err10) throw err10;
        const contagemPorCliente = {};
        contratosPorCliente?.forEach(c => {
            contagemPorCliente[c.cliente_id] = (contagemPorCliente[c.cliente_id] || 0) + 1;
        });
        const clientesRecorrentes = Object.values(contagemPorCliente).filter(c => c > 1);
        dashboard.clientesRecorrentes = contratosPorCliente?.length > 0
            ? Math.round((clientesRecorrentes.length / contratosPorCliente.length) * 100 * 100) / 100
            : 0;

        // Receita por hora
        const { data: contratosComCuidador, error: err11 } = await supabase
            .from('contratar')
            .select('cuidador_id');
        if (err11) throw err11;
        const cuidadorIdsReceita = [...new Set(contratosComCuidador?.map(c => c.cuidador_id).filter(Boolean) || [])];
        const { data: cuidadoresReceita, error: err11b } = await supabase
            .from('cuidador')
            .select('usuario_id, valor_hora')
            .in('usuario_id', cuidadorIdsReceita);
        if (err11b) throw err11b;
        const valorHoraMap = {};
        cuidadoresReceita?.forEach(c => {
            valorHoraMap[c.usuario_id] = parseFloat(c.valor_hora) || 0;
        });
        dashboard.receitaPorHora = contratosComCuidador?.reduce((sum, ct) => {
            return sum + (valorHoraMap[ct.cuidador_id] || 0);
        }, 0) || 0;
=======
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
>>>>>>> c10107dbca028a802d851add394a54dc4ae91c7f

        return dashboard;

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        throw error;
    }
}

module.exports = { getDashboardData };

