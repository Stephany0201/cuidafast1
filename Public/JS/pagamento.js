document.getElementById("btnContinuePayment").addEventListener("click", async () => {
    const metodo = document.querySelector("input[name='payment']:checked")?.value;
  
    if (!metodo) {
      alert("Selecione um método de pagamento.");
      return;
    }
  
    if (metodo === "pix") {
      try {
        const response = await fetch("/api/pagamento/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: 105.90,
            descricao: "Serviço CuidaFast",
            idUsuario: localStorage.getItem("userId") || null
          })
        });
  
        const data = await response.json();
        console.log("Resposta do pagamento:", data);
  
        if (data.init_point) {
          window.location.href = data.init_point; // redireciona para o Mercado Pago
        } else {
          alert("Erro ao iniciar pagamento Pix");
        }
  
      } catch (err) {
        console.error("Erro ao criar pagamento:", err);
        alert("Erro ao conectar com o servidor.");
      }
    }
  });  