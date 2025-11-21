// --- SELETORES DE ELEMENTOS DOM ---
const cardContainer = document.querySelector(".card-container");
const inputBusca = document.querySelector("input");
const botaoBusca = document.querySelector("#botao-busca");
const btnTopo = document.getElementById("btn-topo");
const btnLimpar = document.getElementById("btn-limpar");
const loadingSpinner = document.getElementById("loading-spinner");

// --- CONSTANTES E VARIÁVEIS GLOBAIS ---
// URLs da API da Riot Games
const VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
const BASE_IMG_URL =
  "https://ddragon.leagueoflegends.com/cdn/img/champion/loading/";

// Dicionário para tradução das classes (tags) dos campeões
const TRADUCAO_TAGS = {
  Assassin: "Assassino",
  Fighter: "Lutador",
  Mage: "Mago",
  Marksman: "Atirador",
  Support: "Suporte",
  Tank: "Tanque",
};

let todosCampeoes = []; // Array para armazenar todos os campeões da API
let meuGrafico = null; // Instância do gráfico (Chart.js) para ser destruída e recriada
let versaoAtual = ""; // String para armazenar a versão mais recente do jogo

// --- INICIALIZAÇÃO ---
/**
 * Função principal que é executada quando a página carrega.
 * Busca a versão mais recente do jogo e, em seguida, busca todos os dados dos campeões.
 */
window.onload = async () => {
  try {
    if (loadingSpinner) loadingSpinner.style.display = "flex";
    cardContainer.innerHTML = "";

    const respostaVersoes = await fetch(VERSION_URL);
    const versoes = await respostaVersoes.json();
    versaoAtual = versoes[0]; // A versão mais recente é a primeira do array

    document.getElementById("numero-versao").innerText = versaoAtual;
    console.log(`Patch atual detectado: ${versaoAtual}`);

    // Constrói a URL da API com a versão atual
    const API_URL = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion.json`;
    const respostaCampeoes = await fetch(API_URL);
    const dadosJson = await respostaCampeoes.json();

    // Transforma o objeto de campeões em um array
    todosCampeoes = Object.values(dadosJson.data);

    if (loadingSpinner) loadingSpinner.style.display = "none";
    renderizarCards(todosCampeoes);
    console.log(`${todosCampeoes.length} campeões carregados.`);
  } catch (erro) {
    console.error("Erro Fatal:", erro);
    if (loadingSpinner) loadingSpinner.style.display = "none";
    cardContainer.innerHTML =
      "<p style='color: red; text-align: center;'>Falha ao conectar com a Riot Games. Verifique sua internet.</p>";
  }
};

// --- LÓGICA DE BUSCA ---
/**
 * Filtra a lista de campeões com base no termo digitado no input de busca.
 * A busca é feita no nome, título e tags (classes) do campeão.
 */
async function iniciarBusca() {
  const termoBusca = inputBusca.value.toLowerCase().trim();

  if (termoBusca === "") {
    renderizarCards(todosCampeoes);
    return;
  }

  const dadosFiltrados = todosCampeoes.filter((campeao) => {
    // Permite buscar também pela classe traduzida (ex: "lutador")
    const tagsTraduzidas = campeao.tags.map((tag) =>
      TRADUCAO_TAGS[tag].toLowerCase()
    );
    return (
      campeao.name.toLowerCase().includes(termoBusca) ||
      campeao.title.toLowerCase().includes(termoBusca) ||
      tagsTraduzidas.some((tag) => tag.includes(termoBusca))
    );
  });

  if (dadosFiltrados.length === 0) {
    // Exibe uma mensagem amigável se nenhum campeão for encontrado
    cardContainer.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 3rem;">
                <i class="ph ph-smiley-sad" style="font-size: 5rem; color: #5b5a56; margin-bottom: 1rem;"></i>
                <p style="color: #f0e6d2; font-size: 1.5rem; margin-bottom: 0.5rem;">Ops! Nenhum campeão encontrado.</p>
                <p style="color: #5b5a56;">Verifique a ortografia ou tente outra classe.</p>
            </div>
        `;
    return;
  }

  renderizarCards(dadosFiltrados);
}

// --- EVENT LISTENERS ---

// Evento para o input de busca: aciona a busca a cada caractere digitado
inputBusca.addEventListener("input", () => {
  // Mostra ou esconde o botão de limpar (X)
  if (inputBusca.value.trim().length > 0) btnLimpar.style.display = "block";
  else btnLimpar.style.display = "none";
  iniciarBusca();
});

// Evento para o botão de limpar busca
btnLimpar.addEventListener("click", () => {
  inputBusca.value = "";
  btnLimpar.style.display = "none";
  inputBusca.focus();
  renderizarCards(todosCampeoes); // Renderiza todos os campeões novamente
});

// Evento para o botão de busca principal (lupa)
botaoBusca.addEventListener("click", iniciarBusca);

/**
 * Filtra os campeões pela tag (classe) selecionada nos botões de filtro.
 * @param {string} tag - A tag a ser filtrada (ex: "Fighter", "Mage").
 * @param {HTMLElement} elementoBotao - O elemento do botão que foi clicado.
 */
function filtrarPorTag(tag, elementoBotao) {
  const botoes = document.querySelectorAll(".btn-filtro");
  botoes.forEach((btn) => btn.classList.remove("ativo"));
  elementoBotao.classList.add("ativo");

  if (tag === "Todos") {
    renderizarCards(todosCampeoes);
    return;
  }

  const dadosFiltrados = todosCampeoes.filter((campeao) =>
    campeao.tags.includes(tag)
  );

  if (dadosFiltrados.length === 0) {
    cardContainer.innerHTML = `<p style='color: white; text-align: center; grid-column: 1/-1;'>Nenhum campeão encontrado nesta categoria.</p>`;
    return;
  }
  renderizarCards(dadosFiltrados);
}

// --- RENDERIZAÇÃO ---
/**
 * Renderiza os cards dos campeões no container principal.
 * @param {Array} lista - A lista de campeões a ser renderizada.
 */
function renderizarCards(lista) {
  cardContainer.innerHTML = ""; // Limpa o container antes de renderizar novos cards

  lista.forEach((campeao, index) => {
    let article = document.createElement("article");
    article.classList.add("card");

    // Adiciona um pequeno delay na animação dos primeiros 15 cards para um efeito escalonado
    if (index < 15) article.style.animationDelay = `${index * 0.05}s`;
    else article.style.animationDelay = `0s`;

    // URL da imagem de loading do campeão
    const imgUrl = `${BASE_IMG_URL}${campeao.id}_0.jpg`;

    article.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgUrl}" alt="${
      campeao.name
    }" width="308" height="560" loading="lazy">
            </div>
            <div class="card-content">
                <h2>${campeao.name}</h2>
                <p class="titulo">${campeao.title}</p>
                <p class="descricao">${campeao.blurb}</p>
                <div class="tags">
                    ${campeao.tags
                      .map((tag) => `<span>${TRADUCAO_TAGS[tag] || tag}</span>`)
                      .join("")}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn-skins" onclick="abrirModalSkins('${
                      campeao.id
                    }')">
                        <i class="ph-fill ph-paint-brush-broad"></i> Skins
                    </button>
                </div>
                <button class="btn-detalhes" onclick="abrirModal('${
                  campeao.id
                }')">Ver Detalhes</button>
            </div>
        `;
    cardContainer.appendChild(article);
  });
}

// --- LÓGICA DOS MODAIS ---
/**
 * Abre o modal de skins, buscando e exibindo todas as skins de um campeão específico.
 * @param {string} campeaoId - O ID do campeão (ex: "Aatrox").
 */
async function abrirModalSkins(campeaoId) {
  const modal = document.getElementById("modal-skins-overlay");
  const modalContent = modal.querySelector(".modal-skins-content");
  const containerGaleria = document.getElementById("skins-gallery-container");
  const tituloModal = document.getElementById("skins-campeao-nome");

  containerGaleria.innerHTML =
    "<p style='color:white;'>Carregando visuais...</p>";
  tituloModal.innerText = campeaoId;

  // Define a imagem de fundo do modal com a splash art padrão do campeão
  modalContent.style.backgroundImage = `linear-gradient(to bottom, rgba(9, 20, 40, 0.9), rgba(9, 20, 40, 0.95)), url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${campeaoId}_0.jpg')`;

  document.getElementById("skins-gallery-container").scrollLeft = 0;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Impede o scroll da página principal

  try {
    const urlDetalhada = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion/${campeaoId}.json`;
    const resposta = await fetch(urlDetalhada);
    const dados = await resposta.json();
    const skins = dados.data[campeaoId].skins;

    containerGaleria.innerHTML = "";

    skins.forEach((skin) => {
      const div = document.createElement("div");
      div.classList.add("skin-card");
      const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${campeaoId}_${skin.num}.jpg`;
      const nomeSkin = skin.name === "default" ? "Padrão" : skin.name;

      div.innerHTML = `
                <img src="${imgUrl}" alt="${nomeSkin}" width="308" height="560" loading="lazy">
                <p>${nomeSkin}</p>
            `;
      containerGaleria.appendChild(div);
    });
  } catch (erro) {
    console.error(erro);
    containerGaleria.innerHTML =
      "<p style='color:red;'>Erro ao carregar skins.</p>";
  }
}

/**
 * Fecha o modal de skins.
 */
function fecharModalSkins() {
  document.getElementById("modal-skins-overlay").classList.add("hidden");
  document.body.style.overflow = "auto"; // Restaura o scroll da página principal
}

/**
 * Abre o modal de detalhes de um campeão.
 * Busca informações detalhadas como lore, status e habilidades.
 * @param {string} campeaoId - O ID do campeão (ex: "Ahri").
 */
async function abrirModal(campeaoId) {
  const campeao = todosCampeoes.find((c) => c.id === campeaoId);
  if (!campeao) return;

  const modal = document.getElementById("modal-overlay");
  const img = document.getElementById("modal-img");
  const nome = document.getElementById("modal-nome");
  const titulo = document.getElementById("modal-titulo");
  const desc = document.getElementById("modal-descricao");
  const statsBox = document.querySelector(".stats-box");
  const spellsContainer = document.getElementById("spells-container");

  modal.querySelector(".modal-content").scrollTop = 0; // Garante que o modal abra no topo

  nome.innerText = campeao.name;
  titulo.innerText = campeao.title;
  img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${campeao.id}_0.jpg`;
  desc.innerText = "Buscando arquivos nos arquivos de Runeterra...";
  if (spellsContainer)
    spellsContainer.innerHTML =
      "<p style='color: #a0a0a0'>Carregando habilidades...</p>";

  const info = campeao.info;
  const temStats =
    info.attack > 0 ||
    info.defense > 0 ||
    info.magic > 0 ||
    info.difficulty > 0;

  if (temStats) {
    // Se o campeão tiver estatísticas, exibe a caixa e renderiza o gráfico
    statsBox.style.display = "block";
    // Destrói a instância anterior do gráfico para evitar bugs de renderização
    if (meuGrafico) meuGrafico.destroy();

    const ctx = document.getElementById("graficoPoder").getContext("2d");
    meuGrafico = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Ataque", "Defesa", "Magia", "Dificuldade"],
        datasets: [
          {
            label: "Nível de Poder",
            data: [info.attack, info.defense, info.magic, info.difficulty],
            backgroundColor: "rgba(200, 155, 60, 0.2)",
            borderColor: "#c89b3c",
            pointBackgroundColor: "#f0e6d2",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#c89b3c",
            borderWidth: 2,
          },
        ],
      },
      options: {
        animation: {
          // Força a re-animação do gráfico a cada abertura
          duration: 1500, // 1.5 segundos
          easing: "easeOutQuart", // Efeito suave
        },
        scales: {
          r: {
            angleLines: { color: "rgba(91, 90, 86, 0.3)" },
            grid: { color: "rgba(91, 90, 86, 0.3)" },
            pointLabels: {
              color: "#c89b3c",
              font: { size: 14, family: "'Quicksand', sans-serif" },
            },
            ticks: { display: false, maxTicksLimit: 5 },
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
      },
    });
  } else {
    statsBox.style.display = "none";
  }

  // Exibe o modal
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Impede o scroll da página principal

  try {
    // Busca os dados detalhados (lore, habilidades) do campeão
    const urlDetalhada = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion/${campeaoId}.json`;
    const resposta = await fetch(urlDetalhada);
    const dadosJson = await resposta.json();
    const dadosDetalhados = dadosJson.data[campeaoId];

    desc.innerText = dadosDetalhados.lore;

    if (spellsContainer) {
      spellsContainer.innerHTML = ""; // Limpa o container de habilidades

      const passiva = dadosDetalhados.passive;

      // Renderiza a habilidade passiva
      const imgPassiva = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/img/passive/${passiva.image.full}`;
      spellsContainer.innerHTML += `
                <div class="spell-card">
                    <div class="spell-img-wrapper">
                        <img src="${imgPassiva}" alt="${passiva.name}" width="64" height="64">
                        <span class="spell-key">P</span>
                    </div>
                    <div class="spell-info">
                        <h4>${passiva.name}</h4>
                        <p>${passiva.description}</p>
                    </div>
                </div>
            `;

      // Renderiza as habilidades Q, W, E, R
      const teclas = ["Q", "W", "E", "R"];
      dadosDetalhados.spells.forEach((spell, index) => {
        const imgSpell = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/img/spell/${spell.image.full}`;
        spellsContainer.innerHTML += `
                    <div class="spell-card">
                        <div class="spell-img-wrapper">
                            <img src="${imgSpell}" alt="${spell.name}" width="64" height="64">
                            <span class="spell-key">${teclas[index]}</span>
                        </div>
                        <div class="spell-info">
                            <h4>${spell.name}</h4>
                            <p>${spell.description}</p>
                        </div>
                    </div>
                `;
      });
    }
  } catch (erro) {
    // Em caso de erro, exibe a descrição curta (blurb) e uma mensagem de erro
    console.error(erro);
    desc.innerText = campeao.blurb;
    if (spellsContainer)
      spellsContainer.innerHTML = "<p style='color:red'>Info indisponível.</p>";
  }
}

/**
 * Fecha o modal de detalhes.
 */
function fecharModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.body.style.overflow = "auto"; // Restaura o scroll
}

// --- FUNÇÕES UTILITÁRIAS E EVENTOS GERAIS ---

/** Funções para os botões de scroll da página */
function irParaTopo() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function irParaFinal() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// Exibe ou esconde o botão "Voltar ao Topo" com base na posição do scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btnTopo.classList.remove("hide");
    btnTopo.style.opacity = "1";
    btnTopo.style.pointerEvents = "all";
  } else {
    btnTopo.style.opacity = "0";
    btnTopo.style.pointerEvents = "none";
  }
});

// Permite fechar os modais com a tecla "Escape"
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModal();
    fecharModalSkins();
  }
});

// Permite rolar a galeria de skins horizontalmente com o scroll do mouse
const skinsGallery = document.getElementById("skins-gallery-container");
skinsGallery.addEventListener("wheel", (evt) => {
  if (
    !document.getElementById("modal-skins-overlay").classList.contains("hidden")
  ) {
    evt.preventDefault();
    skinsGallery.scrollLeft += evt.deltaY * 4;
  }
});
