
const CONFIG = {
  // Seu nome (aparece nos textos)
  meuNome: "Malek",


  meuWhatsapp: "5527997248687",


  web3formsAccessKey: "",

  restaurantes: {
    mine:      { nome: "Mine",               desc: "cozinha japonesa" },
    dolina:    { nome: "La Dolina",          desc: "cucina argentina" },
    mercearia: { nome: "Mercearia Liberdade", desc: "lamén" },
  },
};

/* ============================================================
   Não mexa daqui pra baixo, a menos que saiba o que está fazendo
   ============================================================ */
(function () {
  "use strict";

  const stepQuestion = document.getElementById("step-question");
  const stepRestaurants = document.getElementById("step-restaurants");
  const stepConfirm = document.getElementById("step-confirm");

  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const taunt = document.getElementById("taunt");

  const menu = document.querySelector(".menu");
  const confirmText = document.getElementById("confirm-text");
  const btnSend = document.getElementById("btn-send");
  const sendHint = document.getElementById("send-hint");

  let chosenKey = null;

  /* ---------------- etapa 1: o botão "Não" foge ---------------- */

  const taunts = [
    "Voce teve audacia de fazer isso 😾",
    "tenta de novo, quem sabe...",
    "ele não quer ser clicado hoje",
    "só o \u201csim\u201d fica paradinho aqui",
    "acho que ele já entendeu o recado",
  ];
  let dodgeCount = 0;

  function dodge() {
    dodgeCount += 1;

    if (!btnNo.classList.contains("is-roaming")) {
      // Fixa o botão na tela (relativo à janela) para ele poder
      // fugir livremente, mantendo o layout do resto intacto.
      const rect = btnNo.getBoundingClientRect();
      btnNo.classList.add("is-roaming");
      btnNo.style.top = rect.top + "px";
      btnNo.style.left = rect.left + "px";
      // força reflow antes de já reposicionar de novo
      void btnNo.offsetWidth;
    }

    const margin = 16;
    const w = btnNo.offsetWidth || 100;
    const h = btnNo.offsetHeight || 48;
    const maxX = window.innerWidth - w - margin;
    const maxY = window.innerHeight - h - margin;

    const nextX = Math.max(margin, Math.random() * maxX);
    const nextY = Math.max(margin, Math.random() * maxY);

    btnNo.style.left = nextX + "px";
    btnNo.style.top = nextY + "px";

    taunt.textContent = taunts[Math.min(dodgeCount - 1, taunts.length - 1)];

    // pequeno "susto" no botão Sim, reforçando a ideia
    const growth = Math.min(1 + dodgeCount * 0.02, 1.12);
    btnYes.style.transform = `scale(${growth})`;
  }

  btnNo.addEventListener("mouseenter", dodge);
  btnNo.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });
  btnNo.addEventListener("focus", () => { dodge(); btnNo.blur(); });
  // salvaguarda: se por acaso alguém conseguir clicar, não acontece nada além de fugir de novo
  btnNo.addEventListener("click", (e) => { e.preventDefault(); dodge(); });

  window.addEventListener("resize", () => {
    if (btnNo.classList.contains("is-roaming")) {
      const maxX = window.innerWidth - btnNo.offsetWidth - 16;
      const maxY = window.innerHeight - btnNo.offsetHeight - 16;
      btnNo.style.left = Math.min(parseFloat(btnNo.style.left), maxX) + "px";
      btnNo.style.top = Math.min(parseFloat(btnNo.style.top), maxY) + "px";
    }
  });

  /* ---------------- avançar para a etapa 2 ---------------- */

  btnYes.addEventListener("click", () => {
    goToStep(stepRestaurants);
  });

  function goToStep(section) {
    [stepQuestion, stepRestaurants, stepConfirm].forEach((s) => {
      s.hidden = s !== section;
    });
  }

  /* ---------------- etapa 2: escolha do restaurante ---------------- */

  menu.addEventListener("click", (e) => {
    const option = e.target.closest(".option");
    if (!option) return;

    chosenKey = option.dataset.key;
    const info = CONFIG.restaurantes[chosenKey];

    menu.querySelectorAll(".option").forEach((el) => el.classList.remove("is-chosen"));
    option.classList.add("is-chosen");

    confirmText.innerHTML = `Você escolheu <strong>${info.nome}</strong> — ${info.desc}.`;

    setTimeout(() => {
      goToStep(stepConfirm);
      notifyResult(info);
    }, 350);
  });

  /* ---------------- etapa 3: avisar o resultado ---------------- */

  function buildMessage(info) {
    return `Oi ${CONFIG.meuNome} sou a pior jogadora de pokemons champions e escolhi o restaurante: ${info.nome} (${info.desc}).`;
  }

  function notifyResult(info) {
    // Envio automático por e-mail (opcional), assim que ela escolher.
    if (CONFIG.web3formsAccessKey) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: CONFIG.web3formsAccessKey,
          subject: "Ela respondeu ao convite!",
          message: `Resposta: Sim!\nRestaurante escolhido: ${info.nome} (${info.desc})`,
        }),
      }).catch(() => {
        /* falha silenciosa: o botão de WhatsApp abaixo continua como reforço */
      });
    }

    btnSend.onclick = () => {
      const texto = encodeURIComponent(buildMessage(info));
      window.open(`https://wa.me/${CONFIG.meuWhatsapp}?text=${texto}`, "_blank");
    };

    if (!CONFIG.meuWhatsapp || CONFIG.meuWhatsapp === "5500000000000") {
      sendHint.textContent = "Configure o número de WhatsApp em script.js (CONFIG.meuWhatsapp) para este botão funcionar.";
    }
  }
})();
