# 💎 Códice Hextech | Guia de Campeões LoL
🔗 Teste o projeto ao vivo: https://joaofazio.github.io/codice_hextec/

![Status](http://img.shields.io/static/v1?label=STATUS&message=FINALIZADO&color=0ac975&style=for-the-badge)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)

> 🏆 Projeto desenvolvido para a **Imersão Dev com Alura e Google**.

Uma aplicação web interativa e imersiva que consome a API oficial da Riot Games (Data Dragon) para exibir dados detalhados, histórias e estatísticas de todos os campeões de League of Legends em tempo real.

---

## 📱 Preview do Projeto

| 🖥️ Navegação & Gráficos | 🎨 Galeria de Skins | 📱 Mobile (Responsivo) |
| :---: | :---: | :---: |
| <video src="https://github.com/user-attachments/assets/343d91dc-a3ad-4baf-bc2f-c35605996b5a" width="100%" autoplay loop muted playsinline></video> | <video src="https://github.com/user-attachments/assets/3c0e5560-1510-4c92-8701-f4c67fc8a751" width="100%" autoplay loop muted playsinline></video> | <img src="assets/demo-mobile.gif" width="100%"> |
| *Busca em Tempo Real e Chart.js* | *Fundo Dinâmico e Scroll* | *Carrossel Touch e Layout Adaptável* |

---

## ✨ Destaques do Projeto

O projeto aplica os conceitos fundamentais da Imersão com foco total na Experiência do Usuário (UX) e na fidelidade visual:

### ⚙️ Integração & Lógica
* **Consumo de API em Tempo Real:** O sistema consulta o Data Dragon da Riot Games, garantindo que as informações e a versão do patch estejam sempre atualizadas.
* **Visualização de Dados:** Uso criativo da biblioteca **Chart.js** para transformar os números brutos (ataque/defesa) em gráficos visuais de fácil leitura.
* **Busca Dinâmica:** Filtragem instantânea conforme o usuário digita, aplicando a manipulação do DOM ensinada nas aulas.
* **Tratamento de Exceções:** O código prevê casos onde a API não retorna dados (como campeões sem status), evitando erros na tela.

### 🎨 Interface & Design (Hextech)
* **Identidade Visual:** Estilização CSS inspirada no cliente oficial do jogo, utilizando variáveis CSS e Flexbox/Grid para organização.
* **Responsividade:** Layout adaptável que funciona em celulares, tablets e desktops.
* **Galeria de Skins:** Um modal extra para visualização das artes dos campeões com fundo dinâmico.
* **Micro-interações:** Scroll suave, animações, botões flutuantes e efeitos de hover.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 Semântico**
* **CSS3 (Flexbox, Grid, Variáveis, Animações)**
* **JavaScript ES6 (Async/Await, Fetch API)**
* **Chart.js**
* **Phosphor Icons**

---

## 🚀 Como rodar localmente

1. Clone o projeto:
```bash
git clone https://github.com/joaofazio/codice_hextec.git
