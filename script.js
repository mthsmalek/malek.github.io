
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
  "Você teve coragem de tentar 😾",
  "Tenta outra vez 😂",
  "Não vai conseguir...",
  "Só existe uma resposta correta 😌",
  "Aceita logo vai ❤️"
];

let dodgeCount = 0;

// posição atual do botão
let posX = 0;
let posY = 0;
let initialized = false;

function initNoButton() {

    if (initialized) return;

    const rect = btnNo.getBoundingClientRect();

    posX = rect.left;
    posY = rect.top;

    btnNo.style.position = "fixed";
    btnNo.style.left = "0px";
    btnNo.style.top = "0px";
    btnNo.style.transform = `translate(${posX}px, ${posY}px)`;

    initialized = true;

}

function dodge() {

    initNoButton();

    dodgeCount++;

    taunt.textContent =
        taunts[Math.min(dodgeCount - 1, taunts.length - 1)];

    const margin = 20;

    const width = btnNo.offsetWidth;
    const height = btnNo.offsetHeight;

    const maxX = window.innerWidth - width - margin;
    const maxY = window.innerHeight - height - margin;

    let newX;
    let newY;

    do{

        newX = Math.random() * maxX;
        newY = Math.random() * maxY;

    }while(
        Math.abs(newX-posX)<120 &&
        Math.abs(newY-posY)<80
    );

    posX = newX;
    posY = newY;

    btnNo.style.transform =
        `translate(${posX}px, ${posY}px)`;

    btnYes.style.transform =
        `scale(${Math.min(1+dodgeCount*0.03,1.18)})`;

}

btnNo.addEventListener("mouseenter", dodge);

btnNo.addEventListener("touchstart",(e)=>{

    e.preventDefault();

    dodge();

},{passive:false});

btnNo.addEventListener("focus",()=>{

    dodge();

    btnNo.blur();

});

btnNo.addEventListener("click",(e)=>{

    e.preventDefault();

    dodge();

});

window.addEventListener("resize",()=>{

    if(!initialized) return;

    const width=btnNo.offsetWidth;
    const height=btnNo.offsetHeight;

    posX=Math.min(posX,window.innerWidth-width-20);
    posY=Math.min(posY,window.innerHeight-height-20);

    btnNo.style.transform=
        `translate(${posX}px,${posY}px)`;

});

  /* ---------------- avançar para a etapa 2 ---------------- */

 btnYes.addEventListener("click", () => {

    btnYes.disabled = true;

    btnYes.style.transform = "scale(1.12)";

    btnYes.style.boxShadow =
        "0 0 30px rgba(201,162,39,.65)";

    ticket.classList.add("fade-out");

    setTimeout(() => {

        goToStep(stepRestaurants);

        ticket.classList.remove("fade-out");

        ticket.classList.add("fade-in");

        setTimeout(() => {

            ticket.classList.remove("fade-in");

            btnYes.disabled = false;

        },400);

    },300);

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
