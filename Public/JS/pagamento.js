document.addEventListener('DOMContentLoaded', () => {
    const containerzin = document.querySelector('.containerzin');

    // Simulação de dados do pedido
    const order = {
        service: 95.00,
        tax: 10.00,
        total: 105.00
    };

    // Função para carregar o conteúdo da página
    function loadPage(page, data = {}) {
        switch (page) {
            case 'agendado':
                renderAgendado();
                break;
            case 'metodo-pagamento':
                renderMetodoPagamento();
                break;
            case 'pix':
                renderPix();
                break;
            case 'pagseguro':
                renderPagseguro();
                break;
            case 'pagseguro-finalizar':
                renderPagseguroFinalizar(data);
                break;
            case 'pix-finalizar':
                renderPixFinalizar(data);
                break;
            case 'intime':
                renderInTime();
                break;
            case 'resumo-intime':
                renderResumoInTime(data);
                break;
        }
    }

    // Renderiza a página de agendamento
    function renderAgendado() {
        containerzin.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Contratar</h1>
                </div>
                <div class="cardzin">
                    <div class="form-group">
                        <label for="cep">CEP</label>
                        <input type="text" id="cep" value="015001-002">
                    </div>
                    <div class="form-group">
                        <label for="logradouro">Logradouro</label>
                        <input type="text" id="logradouro" value="Rua zumbi dos palmares 201">
                    </div>
                    <div class="form-group">
                        <label for="bairro">Bairro</label>
                        <input type="text" id="bairro" value="Liberdade">
                    </div>
                    <div class="form-group">
                        <label for="cidade">Cidade</label>
                        <input type="text" id="cidade" value="São Paulo">
                    </div>
                    <div class="form-group">
                        <label for="estado">Estado</label>
                        <input type="text" id="estado" value="SP">
                    </div>
                    <div class="form-group">
                        <label for="complemento">Complemento</label>
                        <input type="text" id="complemento" value="Apt 123">
                    </div>
                </div>
                <button class="button" id="continue-btn">➡️ Continuar agora</button>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.getElementById('continue-btn').addEventListener('click', () => {
            loadPage('metodo-pagamento');
        });
    }

    // Renderiza a página de método de pagamento
    function renderMetodoPagamento() {
        containerzin.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Método de pagamento</h1>
                </div>
                <div class="cardzin">
                    <div class="payment-method-option">
                        <input type="radio" id="pix" name="payment-method" value="pix" checked>
                        <label for="pix"><i class="ph ph-pix-logo"></i> Pix</label>
                    </div>
                    <div class="payment-method-option">
                        <input type="radio" id="pagseguro" name="payment-method" value="pagseguro">
                        <label for="pagseguro"><i class="ph ph-credit-card"></i> Pag Seguro</label>
                    </div>
                </div>
                <button class="button" id="continue-payment-btn">➡️ Continuar</button>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector('.back-button').addEventListener('click', () => {
            loadPage('agendado');
        });
    }

    // Renderiza a página de pagamento com PIX
    function renderPix() {
        containerzin.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Pagamento PIX</h1>
                </div>
                <div class="cardzin text-center">
                    <div class="qr-code-containerzin">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://github.com/google/generative-ai-docs" alt="QR Code PIX" style="margin-bottom: 20px;">
                        <p><strong>Pedido #0001</strong></p>
                    </div>
                    <button class="button" id="copy-pix-btn">📋 Copiar código Pix</button>
                    <button class="button secondary" id="view-order-btn">👁️ Ver Pedido</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("metodo-pagamento");
        });

        document.getElementById("copy-pix-btn").addEventListener("click", () => {
            navigator.clipboard.writeText("chave-pix-aleatoria").then(() => {
                alert("Código PIX copiado!");
            });
        });
    }

    // Renderiza a página de pagamento com PagSeguro
    function renderPagseguro() {
        containerzin.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Pagamento PagSeguro</h1>
                </div>
                <div class="cardzin">
                    <p>Simulação de formulário de cartão de crédito:</p>
                    <div class="form-group">
                        <label for="card-number">Número do Cartão</label>
                        <input type="text" id="card-number" placeholder="**** **** **** ****">
                    </div>
                    <div class="form-group">
                        <label for="card-validity">Validade</label>
                        <input type="text" id="card-validity" placeholder="MM/AA">
                    </div>
                    <div class="form-group">
                        <label for="card-cvv">CVV</label>
                        <input type="text" id="card-cvv" placeholder="***">
                    </div>
                    <button class="button" id="submit-card-btn">💳 Pagar com Cartão</button>
                    <p style="text-align: center; margin: 20px 0; color: var(--color-text-secondary);">Ou</p>
                    <button class="button secondary" id="redirect-pagseguro-btn">🔗 Simular Redirecionamento PagSeguro</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("metodo-pagamento");
        });

        document.getElementById("submit-card-btn").addEventListener("click", () => {
            alert("Simulando pagamento com cartão...");
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    loadPage("pagseguro-finalizar", { status: "success" });
                } else {
                    loadPage("pagseguro-finalizar", { status: "error" });
                }
            }, 1500);
        });

        document.getElementById("redirect-pagseguro-btn").addEventListener("click", () => {
            alert("Simulando redirecionamento para PagSeguro...");
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    loadPage("pagseguro-finalizar", { status: "success" });
                } else {
                    loadPage("pagseguro-finalizar", { status: "error" });
                }
            }, 1500);
        });
    }

    // Renderiza a página de finalização do PagSeguro
    function renderPagseguroFinalizar(data) {
        containerzin.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Pagamento ${data.status === "success" ? "realizado com sucesso!" : "falhou!"}</h1>
                </div>
                <div class="cardzin text-center">
                    ${data.status === "success" ? `<div class="qr-code-container"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://github.com/google/generative-ai-docs" alt="QR Code" style="margin-bottom: 20px;"><p><strong>Resumo do Pedido #0001</strong></p></div>` : `<p>❌ Ocorreu um erro no pagamento.</p>`}
                    <button class="button" id="cancel-order-btn">❌ Cancelar pedido</button>
                    <button class="button secondary" id="back-btn">⬅️ Voltar</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("metodo-pagamento");
        });

        document.getElementById("back-btn").addEventListener("click", () => {
            loadPage("agendado");
        });
    }

    // Renderiza a página de finalização do Pix
    function renderPixFinalizar(data) {
        container.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Pagamento ${data.status === "success" ? "realizado com sucesso!" : "falhou!"}</h1>
                </div>
                <div class="cardzin text-center">
                    ${data.status === "success" ? `<div class="qr-code-container"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://github.com/google/generative-ai-docs" alt="QR Code" style="margin-bottom: 20px;"><p><strong>Resumo do Pedido #0001</strong></p></div>` : `<p>❌ Ocorreu um erro no pagamento.</p>`}
                    <button class="button" id="cancel-order-btn">❌ Cancelar pedido</button>
                    <button class="button secondary" id="back-btn">⬅️ Voltar</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("metodo-pagamento");
        });

        document.getElementById("back-btn").addEventListener("click", () => {
            loadPage("agendado");
        });
    }

    // Renderiza a página de pagamento In Time
    function renderInTime() {
        container.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Pagamento In Time</h1>
                </div>
                <div class="cardzin">
                    <p>Esta é uma simulação de pagamento rápido.</p>
                    <button class="button" id="process-intime-btn">⚡ Processar Pagamento Rápido</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("agendado");
        });

        document.getElementById("process-intime-btn").addEventListener("click", () => {
            alert("Processando pagamento rápido...");
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    loadPage("resumo-intime", { status: "success" });
                } else {
                    loadPage("resumo-intime", { status: "error" });
                }
            }, 1500);
        });
    }

    // Renderiza a página de resumo In Time
    function renderResumoInTime(data) {
        container.innerHTML = `
            <div class="main-content">
                <div class="header">
                    <button class="back-button"><i class="ph ph-arrow-left"></i></button>
                    <h1>Resumo do Pagamento In Time</h1>
                </div>
                <div class="cardzin text-center">
                    ${data.status === "success" ? `<p>Pagamento rápido realizado com sucesso!</p>` : `<p>O pagamento rápido falhou.</p>`}
                    <p>Detalhes do Pedido #0001</p>
                    <div class="summary-item">
                        <span>Serviço</span>
                        <span>R$ ${order.service.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Taxa</span>
                        <span>R$ ${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-total">
                        <span>Total Pago</span>
                        <span>R$ ${order.total.toFixed(2)}</span>
                    </div>
                    <button class="button" id="back-to-home-btn">🏠 Voltar ao Início</button>
                </div>
            </div>
            <div class="summary-panel">
                <h3>Resumo da compra</h3>
                <div class="summary-item">
                    <span>Serviço</span>
                    <span>R$ ${order.service.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Taxa</span>
                    <span>R$ ${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-total">
                    <span>Você pagará</span>
                    <span>R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;

        document.querySelector(".back-button").addEventListener("click", () => {
            loadPage("intime");
        });

        document.getElementById("back-to-home-btn").addEventListener("click", () => {
            loadPage("agendado");
        });
    }

    // Event Listeners Globais
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "continue-payment-btn") {
            const selectedPaymentMethod = document.querySelector("input[name='payment-method']:checked").value;
            if (selectedPaymentMethod === "pix") {
                loadPage("pix");
            } else if (selectedPaymentMethod === "pagseguro") {
                loadPage("pagseguro");
            }
        } else if (e.target && e.target.id === "view-order-btn") {
            alert("Verificando status do pedido...");
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    loadPage("pix-finalizar", { status: "success" });
                } else {
                    loadPage("pix-finalizar", { status: "error" });
                }
            }, 1500);
        }
    });

    // Carregar a página inicial
    loadPage('agendado');
});
