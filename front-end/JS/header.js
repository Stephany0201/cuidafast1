document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("userProfileDropdown");
  const profileBtn = document.getElementById("userProfileBtn");
  const dropdownMenu = document.getElementById("profileDropdownMenu");

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
