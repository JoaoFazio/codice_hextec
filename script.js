/**
 * Códice Hextech - Script Principal
 *
 * Este script gerencia a busca de dados da API do League of Legends (DDragon),
 * a renderização dos campeões, a funcionalidade de busca e filtros, e a
 * exibição de modais com detalhes dos campeões e suas skins.
 */

// --- SELETORES DE ELEMENTOS DO DOM ---
const cardContainer = document.querySelector(".card-container");
const inputBusca = document.querySelector("input");
const botaoBusca = document.querySelector("#botao-busca");
const btnTopo = document.getElementById("btn-topo");
const btnLimpar = document.getElementById("btn-limpar");
const loadingSpinner = document.getElementById("loading-spinner");

// --- CONSTANTES E CONFIGURAÇÕES ---
const VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
const BASE_IMG_URL =
  "https://ddragon.leagueoflegends.com/cdn/img/champion/loading/";

// Dicionário para traduzir as tags de classe dos campeões para português.
const TRADUCAO_TAGS = {
  Assassin: "Assassino",
  Fighter: "Lutador",
  Mage: "Mago",
  Marksman: "Atirador",
  Support: "Suporte",
  Tank: "Tanque",
};

// Variáveis Globais
let todosCampeoes = [];
let meuGrafico = null; // Armazena a instância do Chart.js para poder destruí-la depois.
let versaoAtual = ""; // Armazena a versão mais recente do patch do jogo.

// --- FUNÇÃO DE INICIALIZAÇÃO ---
/**
 * Executada quando a página carrega. Busca a versão mais recente do jogo
 * e, em seguida, busca todos os dados dos campeões para essa versão.
 */
window.onload = async () => {
  try {
    // Exibe o spinner de carregamento enquanto os dados são buscados.
    if (loadingSpinner) loadingSpinner.style.display = "flex";
    cardContainer.innerHTML = "";

    // 1. Busca a lista de versões da API e pega a mais recente (a primeira da lista).
    const respostaVersoes = await fetch(VERSION_URL);
    const versoes = await respostaVersoes.json();
    versaoAtual = versoes[0];

    document.getElementById("numero-versao").innerText = versaoAtual;
    console.log(`Patch atual detectado: ${versaoAtual}`);

    // 2. Constrói a URL da API com a versão atual e busca os dados dos campeões.
    const API_URL = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion.json`;
    const respostaCampeoes = await fetch(API_URL);
    const dadosJson = await respostaCampeoes.json();

    todosCampeoes = Object.values(dadosJson.data); // Converte o objeto de campeões em um array.

    // Esconde o spinner e renderiza os cards dos campeões na tela.
    if (loadingSpinner) loadingSpinner.style.display = "none";
    renderizarCards(todosCampeoes);
  } catch (erro) {
    console.error("Erro Fatal:", erro);
    if (loadingSpinner) loadingSpinner.style.display = "none";
    // Exibe uma mensagem de erro para o usuário caso a API falhe.
    cardContainer.innerHTML =
      "<p style='color: red; text-align: center;'>Falha ao conectar com a Riot Games. Verifique sua internet.</p>";
  }
};

/**
 * Filtra a lista de campeões com base no termo digitado no campo de busca.
 * A busca é "live", ou seja, acontece enquanto o usuário digita.
 */
async function iniciarBusca() {
  const termoBusca = inputBusca.value.toLowerCase().trim();

  // Se a busca estiver vazia, renderiza todos os campeões.
  if (termoBusca === "") {
    renderizarCards(todosCampeoes);
    return;
  }

  // Filtra o array 'todosCampeoes'
  const dadosFiltrados = todosCampeoes.filter((campeao) => {
    const tagsTraduzidas = campeao.tags.map((tag) =>
      TRADUCAO_TAGS[tag].toLowerCase()
    );

    // A busca funciona por nome, título ou classe (tag).
    return (
      campeao.name.toLowerCase().includes(termoBusca) ||
      campeao.title.toLowerCase().includes(termoBusca) ||
      tagsTraduzidas.some((tag) => tag.includes(termoBusca))
    );
  });

  // Se nenhum campeão for encontrado, exibe uma mensagem informativa.
  if (dadosFiltrados.length === 0) {
    cardContainer.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 3rem;">
                <i class="ph ph-smiley-sad" style="font-size: 5rem; color: #5b5a56; margin-bottom: 1rem;"></i>
                <p style="color: #f0e6d2; font-size: 1.5rem; margin-bottom: 0.5rem;">Ops! Nenhum campeão encontrado.</p>
                <p style="color: #5b5a56;">Verifique a ortografia ou tente outra classe.</p>
            </div>
        `;
    return;
  }

  // Renderiza apenas os campeões filtrados.
  renderizarCards(dadosFiltrados);
}

// --- EVENTOS DE BUSCA ---

// Evento 'input' para a busca em tempo real.
inputBusca.addEventListener("input", () => {
  if (inputBusca.value.trim().length > 0) btnLimpar.style.display = "block";
  else btnLimpar.style.display = "none";
  iniciarBusca();
});

// Evento de clique para o botão de limpar a busca.
btnLimpar.addEventListener("click", () => {
  inputBusca.value = "";
  btnLimpar.style.display = "none";
  inputBusca.focus();
  renderizarCards(todosCampeoes);
});

/**
 * Filtra os campeões com base na tag (classe) selecionada nos botões de filtro.
 * @param {string} tag - A tag para filtrar (ex: "Mage", "Tank").
 * @param {HTMLElement} elementoBotao - O elemento do botão que foi clicado.
 */
function filtrarPorTag(tag, elementoBotao) {
  inputBusca.value = "";
  btnLimpar.style.display = "none";
  // Gerencia a classe 'ativo' para destacar o filtro selecionado.
  const botoes = document.querySelectorAll(".btn-filtro");
  botoes.forEach((btn) => btn.classList.remove("ativo"));
  elementoBotao.classList.add("ativo");

  // Se a tag for "Todos", exibe todos os campeões.
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

/**
 * Renderiza os cards dos campeões na tela.
 * @param {Array} lista - A lista de campeões a ser renderizada.
 */
function renderizarCards(lista) {
  cardContainer.innerHTML = ""; // Limpa o contêiner antes de adicionar novos cards.

  lista.forEach((campeao, index) => {
    let article = document.createElement("article");
    article.classList.add("card");

    // Adiciona um pequeno delay na animação dos primeiros cards para um efeito de cascata.
    if (index < 15) article.style.animationDelay = `${index * 0.05}s`;
    else article.style.animationDelay = `0s`;

    // URL da imagem de loading do campeão.
    const imgUrl = `${BASE_IMG_URL}${campeao.id}_0.jpg`;

    // Cria o HTML do card com os dados do campeão.
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

/**
 * Abre o modal de skins, buscando e exibindo todas as skins de um campeão específico.
 * Também aplica um fundo dinâmico ao modal com a splash art do campeão.
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

  // Injeta a splash art do campeão como imagem de fundo do modal.
  modalContent.style.backgroundImage = `linear-gradient(to bottom, rgba(9, 20, 40, 0.9), rgba(9, 20, 40, 0.95)), url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${campeaoId}_0.jpg')`;

  // Exibe o modal e trava o scroll do body.
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  try {
    // Busca os dados detalhados do campeão para obter a lista de skins.
    const urlDetalhada = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion/${campeaoId}.json`;
    const resposta = await fetch(urlDetalhada);
    const dados = await resposta.json();
    const skins = dados.data[campeaoId].skins;

    containerGaleria.innerHTML = ""; // Limpa a mensagem de "carregando".

    // Itera sobre a lista de skins e cria um card para cada uma.
    skins.forEach((skin) => {
      const div = document.createElement("div");
      div.classList.add("skin-card");
      const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${campeaoId}_${skin.num}.jpg`;
      const nomeSkin = skin.name === "default" ? "Padrão" : skin.name;

      div.innerHTML = `
                <img src="${imgUrl}" alt="${nomeSkin}">
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
function fecharModalSkins(event) {
  document.getElementById("modal-skins-overlay").classList.add("hidden");
  document.body.style.overflow = "auto";
}

/**
 * Abre o modal de detalhes do campeão, exibindo lore, habilidades e um gráfico de status.
 * @param {string} campeaoId - O ID do campeão.
 */
async function abrirModal(campeaoId) {
  // Encontra o campeão na lista global para obter dados básicos rapidamente.
  const campeao = todosCampeoes.find((c) => c.id === campeaoId);
  if (!campeao) return;

  const modal = document.getElementById("modal-overlay");
  const img = document.getElementById("modal-img");
  const nome = document.getElementById("modal-nome");
  const titulo = document.getElementById("modal-titulo");
  const desc = document.getElementById("modal-descricao");
  const statsBox = document.querySelector(".stats-box");
  const spellsContainer = document.getElementById("spells-container");

  // Preenche o modal com informações básicas imediatamente disponíveis.
  nome.innerText = campeao.name;
  titulo.innerText = campeao.title;
  img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${campeao.id}_0.jpg`;
  desc.innerText = "Buscando arquivos nos arquivos de Runeterra...";
  if (spellsContainer)
    spellsContainer.innerHTML =
      "<p style='color: #a0a0a0'>Carregando habilidades...</p>";

  const info = campeao.info;
  // Verifica se o campeão possui dados de status para exibir o gráfico.
  const temStats =
    info.attack > 0 ||
    info.defense > 0 ||
    info.magic > 0 ||
    info.difficulty > 0;

  if (temStats) {
    statsBox.style.display = "block";
    // Destrói o gráfico anterior, se existir, para evitar sobreposições.
    if (meuGrafico) meuGrafico.destroy();

    // Cria um novo gráfico de radar com Chart.js.
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

  // Exibe o modal.
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Busca os dados detalhados (lore, habilidades) que não vêm na primeira chamada.
  try {
    const urlDetalhada = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/data/pt_BR/champion/${campeaoId}.json`;
    const resposta = await fetch(urlDetalhada);
    const dadosJson = await resposta.json();
    const dadosDetalhados = dadosJson.data[campeaoId];

    // Atualiza a lore do campeão.
    desc.innerText = dadosDetalhados.lore;

    // Renderiza as Habilidades (Passiva e Q, W, E, R).
    if (spellsContainer) {
      spellsContainer.innerHTML = "";

      // Renderiza a habilidade passiva.
      const passiva = dadosDetalhados.passive;
      const imgPassiva = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/img/passive/${passiva.image.full}`;
      spellsContainer.innerHTML += `
                <div class="spell-card">
                    <div class="spell-img-wrapper">
                        <img src="${imgPassiva}" alt="${passiva.name}">
                        <span class="spell-key">P</span>
                    </div>
                    <div class="spell-info">
                        <h4>${passiva.name}</h4>
                        <p>${passiva.description}</p>
                    </div>
                </div>
            `;

      // Itera e renderiza as 4 habilidades ativas.
      const teclas = ["Q", "W", "E", "R"];
      dadosDetalhados.spells.forEach((spell, index) => {
        const imgSpell = `https://ddragon.leagueoflegends.com/cdn/${versaoAtual}/img/spell/${spell.image.full}`;
        spellsContainer.innerHTML += `
                    <div class="spell-card">
                        <div class="spell-img-wrapper">
                            <img src="${imgSpell}" alt="${spell.name}">
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
    // Em caso de erro na busca detalhada, exibe a sinopse (blurb) como fallback.
    console.error(erro);
    desc.innerText = campeao.blurb;
    if (spellsContainer)
      spellsContainer.innerHTML = "<p style='color:red'>Info indisponível.</p>";
  }
}

/**
 * Fecha o modal de detalhes.
 */
function fecharModal(event) {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.body.style.overflow = "auto";
}

// --- FUNÇÕES DE CONTROLE DE SCROLL E EVENTOS GERAIS ---

function irParaTopo() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function irParaFinal() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// Exibe o botão "Voltar ao Topo" apenas quando o usuário rola a página para baixo.
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btnTopo.classList.remove("hide");
    // A manipulação direta de 'opacity' e 'pointerEvents' é uma alternativa à classe 'hide'
    // para garantir que a transição de opacidade funcione corretamente ao aparecer.
    btnTopo.style.opacity = "1";
    btnTopo.style.pointerEvents = "all";
  } else {
    btnTopo.style.opacity = "0";
    btnTopo.style.pointerEvents = "none";
  }
});

// Adiciona um atalho global: a tecla "Escape" fecha qualquer modal que estiver aberto.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModal();
    fecharModalSkins();
  }
});

// Adiciona o evento de clique ao botão de busca, embora a busca principal seja "live".
botaoBusca.addEventListener("click", iniciarBusca);
