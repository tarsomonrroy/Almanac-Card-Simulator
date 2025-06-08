const json = {
    "seedType": 1109,
    "name": "<size=42>Snipervilha",
    "introduce": "<size=30><color=black>Admira-se por sua visão aguçada e força robusta, Snipervilha é querido por seus companheiros de Ervilha. No entanto, durante suas marchas de formação, o cano de sua arma frequentemente encontra o caminho para as costas de suas cabeças, criando momentos tensos ao longo do caminho.</color></size>",
    "info": "<size=32>Atira em zumbis em todo o mapa para causar danos massivos.\n\n<color=black>Dano: </color><color=#8B0000>500 | 3 segundos</color>\n<color=#780072>Especial: </color><color=#8B0000>Dispara na cabeça de um zumbi uma vez a cada 6 disparos, matando instantâneamente zumbis. Pode ser gerados fora da Odisseia por Cevadas ou Trilha Zumbi.</color></size>",
    "cost": "<size=28>Custo: <color=red>600</color>\nRecarga: <color=#8B0000>7,5 segundos</color>\nDisponível somente no Modo Odisseia.</color></size>"
};

function parseRichText(text) {
    const baseSize = -13;
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