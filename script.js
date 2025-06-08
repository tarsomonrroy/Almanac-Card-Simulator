const json = {
    "seedType": 1241,
      "name": "<size=42>Luminívora",
      "introduce": "<size=30><color=black>Dizem que a Luminívora nunca falha como uma legítima planta carnívora, sempre engolindo um prato cheio de zumbis em tempo recorde. Ela até publicou um livro ensinando seus segredos para capturar zumbis: \u0022Balance... balance suavemente, eles gostam quando você balança uma luz bem saborosa na frente deles...\u0022\n— DIONAEA, Luminívora. 'A Arte da Fisgada', Metaphyta Plantae, 2025.</color>\n\n\n\n\n\n\n<<<<<< Página Anterior",
      "info": "<size=32>Carnívora que usa a luz para atrair inimigos com melhor digestão.\n\n<color=black>Dano: </color><color=#8B0000>Morte instantânea</color>\n<color=black>Digestão: </color><color=#8B0000>40 segundos</color>\n<color=#780072>Especial: </color><color=#8B0000>Cada Nível de Lumos reduz o tempo de digestão em 10 segundos, com um mínimo de 10 segundos. Ao finalizar sua digestão, se não houver zumbis a frente, pode atrair um zumbi próximo de uma fileira adjacente a sua e devorá-lo.</color>\n\n\n\n>>>>>> Próxima Página",
      "cost": "<size=28>\n\n<color=black>Fórmula de Fusão: </color><color=#8B0000>Carnívora + Planterna</color>"
};

function parseRichText(text) {
    const baseSize = -12;
    return text
        .replace(/<size=(\d+)>/g, (_, s) => {
            const totalSize = baseSize + parseInt(s);
            return `<span style="font-size:${totalSize}px">`;
        })
        .replace(/<\/size>/g, `</span>`)
        .replace(/<color=([#\w]+)>/g, (_, c) => `<span style="color:${c}">`)
        .replace(/<\/color>/g, `</span>`);
}

const title = document.getElementById("title");
const text = document.getElementById("text");
const cost = document.getElementById("cost");
const pageIndicator = document.getElementById("page-indicator");

const plantId = json.seedType;
const plantName = json.name.replace(/<[^>]+>/g, ""); // remove tags

title.innerHTML = `${plantName}(${plantId})`;

const infoIntro = `${json.info}\n\n${json.introduce}`;
const parsedText = parseRichText(infoIntro).split('\n');
const maxLines = 14;
const pages = [];

for (let i = 0; i < parsedText.length; i += maxLines) {
    pages.push(parsedText.slice(i, i + maxLines).join('\n'));
}

let currentPage = 0;

function nextPage() {
    currentPage = (currentPage + 1) % pages.length;
    renderPage();
}

function renderPage() {
    text.innerHTML = parseRichText(pages[currentPage]);
    // pageIndicator.textContent = `Página ${currentPage + 1} de ${pages.length}`;
}

cost.innerHTML = parseRichText(json.cost);
renderPage();