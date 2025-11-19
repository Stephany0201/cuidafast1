document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("userProfileDropdown");
  const profileBtn = document.getElementById("userProfileBtn");
  const dropdownMenu = document.getElementById("profileDropdownMenu");

  /**
   * Atualiza o link da logo baseado no tipo de usuário
   * Cliente -> homeCliente.html
   * Cuidador -> dashboard-cuidador.html
   */
  function updateLogoLink() {
    try {
      const userData = localStorage.getItem('cuidafast_user');
      if (!userData) {
        // Se não estiver logado, manter link padrão ou redirecionar para index
        const logoLink = document.querySelector('.logo-link');
        if (logoLink && !logoLink.href.includes('index.html')) {
          // Se estiver em uma página HTML, pode manter o link atual ou redirecionar para index
          const currentPath = window.location.pathname;
          if (currentPath.includes('HTML')) {
            logoLink.href = '../../index.html';
          }
        }
        return;
      }

      const user = JSON.parse(userData);
      const logoLink = document.querySelector('.logo-link') || document.getElementById('logoLink');
      
      if (!logoLink) return;

      // Determinar o caminho correto baseado na localização atual
      const currentPath = window.location.pathname;
      let pathPrefix = '';
      
      if (currentPath.includes('/HTML/')) {
        pathPrefix = '';
      } else if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
        pathPrefix = 'front-end/HTML/';
      } else {
        pathPrefix = '../HTML/';
      }

      // Atualizar link baseado no tipo de usuário
      if (user.tipo === 'cuidador') {
        logoLink.href = pathPrefix + 'dashboard-cuidador.html';
        console.log('[Header] Logo atualizada para dashboard-cuidador.html');
      } else if (user.tipo === 'cliente') {
        logoLink.href = pathPrefix + 'homeCliente.html';
        console.log('[Header] Logo atualizada para homeCliente.html');
      } else {
        // Tipo desconhecido, redirecionar para index
        logoLink.href = '../../index.html';
        console.log('[Header] Tipo de usuário desconhecido, redirecionando para index');
      }
    } catch (error) {
      console.error('[Header] Erro ao atualizar link da logo:', error);
    }
  }

  // Atualizar link da logo ao carregar
  updateLogoLink();

  function closeDropdown() {
    if (!dropdown) return;
    dropdown.classList.remove("open");
    if (profileBtn) profileBtn.setAttribute("aria-expanded", "false");
  }

  function toggleDropdown() {
    if (!dropdown) return;
    const isOpen = dropdown.classList.toggle("open");
    if (profileBtn) profileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  if (profileBtn && dropdownMenu && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }

  // Configurar navegação - Notificações
  const notificationBtn = document.getElementById("notificationBtn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = 'solicitacoesServicos.html';
    });
  }

  // Configurar navegação - Mensagens
  const messageBtn = document.getElementById("messageBtn");
  if (messageBtn) {
    messageBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = 'mensagens.html';
    });
  }
});
