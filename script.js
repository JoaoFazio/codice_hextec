let cardContainer = document.querySelector(".card-container");
let dados = [];

async function iniciarBusca() {
  const termoBusca = document.querySelector("input").value.toLowerCase();
  let resposta = await fetch("data.json");
  dados = await resposta.json();

  if (termoBusca) {
    const dadosFiltrados = dados.filter((dado) =>
      dado.nome.toLowerCase().includes(termoBusca)
    );
    renderizarCards(dadosFiltrados);
  } else {
    renderizarCards(dados);
  }
}

function renderizarCards(dados) {
  cardContainer.innerHTML = "";
  for (let dado of dados) {
    let article = document.createElement("article");
    article.classList.add("card");
    article.innerHTML = `
        <h2>${dado.nome}</h2>
          <p>${dado.ano}</p>
          <p>${dado.descricao}</p>
          <a href="${dado.link}" target="_blank">Saiba mais</a>
        `;
    cardContainer.appendChild(article);
  }
}
