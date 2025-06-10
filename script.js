const json = {
    "seedType": 8,
      "name": "<size=42>Hipnogumelo",
      "introduce": "<size=30><color=black>\u0022Os zumbis são nossos amigos,\u0022 afirma Hipnogumelo. \u0022São criaturas incompreendidas que desempenham um papel valioso na nossa ecologia. Podemos e devemos fazer mais para trazê-los ao nosso modo de pensar.\u0022</color></size>",
      "info": "<size=32>Encanta um zumbi para lutar por você.\n\n<color=#780072>Especial: </color><color=#8B0000>Faz um único zumbi lutar por você.</color></size>",
      "cost": "<size=28>\nCusto: <color=#8B0000>75</color>\nRecarga: <color=#8B0000>30 segundos</color></size>"
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

function splitStyledText(text, maxHeight, container) {
    const measurer = document.createElement("div");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.pointerEvents = "none";
    measurer.style.whiteSpace = "pre-wrap";
    measurer.style.width = getComputedStyle(container).width;
    measurer.style.fontSize = getComputedStyle(container).fontSize;
    measurer.style.lineHeight = getComputedStyle(container).lineHeight;
    measurer.style.fontFamily = getComputedStyle(container).fontFamily;
    document.body.appendChild(measurer);

    const pages = [];

    const styleMatch = text.match(/^((<[^>]+>)+)/);
    const stylePrefix = styleMatch ? styleMatch[1] : "";
    const cleanText = text.replace(/^((<[^>]+>)+)/, "");

    const fullStyled = stylePrefix + cleanText;
    const words = fullStyled.split(/(?=\s)|(?<=\s)/); // mantém espaços

    let current = "";
    for (let i = 0; i < words.length; i++) {
        current += words[i];
        measurer.innerHTML = parseRichText(current);
        if (measurer.scrollHeight > maxHeight) {
            const fallback = current.split(/(?=\s)|(?<=\s)/);
            const lastWord = fallback.pop();
            const pageContent = fallback.join("").trim();
            pages.push(pageContent);
            current = lastWord + words.slice(i + 1).join("");
            i = words.length; // força novo loop
            return pages.concat(splitStyledText(current.trim(), maxHeight, container));
        }
    }

    if (current.trim() !== "") {
        pages.push(current.trim());
    }

    document.body.removeChild(measurer);
    return pages;
}

function extractOpenCustomTags(raw) {
    const stack = [];
    const re = /<color=[^>]+>|<size=\d+>|<\/color>|<\/size>/g;
    let m;
    while ((m = re.exec(raw))) {
        const tag = m[0];
        if (tag.startsWith('<color=') || tag.startsWith('<size=')) {
            stack.push(tag);
        } else {
            if (tag === '</color>') {
                for (let i = stack.length - 1; i >= 0; i--) {
                    if (stack[i].startsWith('<color=')) {
                        stack.splice(i, 1);
                        break;
                    }
                }
            }
            if (tag === '</size>') {
                for (let i = stack.length - 1; i >= 0; i--) {
                    if (stack[i].startsWith('<size=')) {
                        stack.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    return stack.join('');
}

const textArea = document.getElementById("text");
const cost = document.querySelector(".cost");

// Título
const titleElement = document.createElement("div");
titleElement.classList.add("title");
titleElement.innerHTML = `${json.name.replace(/<[^>]+>/g, "")} (${json.seedType})`;
document.querySelector(".card").insertBefore(titleElement, textArea);

// Cost
cost.innerHTML = parseRichText(json.cost);

// Texto a ser exibido
const combinedText = json.info + "\n\n" + json.introduce;
const maxHeight = 11 * 1.5 * 16; // ajustado

// Etapa 1: divide o texto original em páginas
const rawPages = splitStyledText(combinedText, maxHeight, textArea);

// Etapa 2: corrige páginas com tags abertas
const fixedRawPages = [];
for (let i = 0; i < rawPages.length; i++) {
    const prev = i > 0 ? fixedRawPages[i - 1] : null;
    const prefix = prev ? extractOpenCustomTags(prev) : '';
    fixedRawPages.push(prefix + rawPages[i]);
}

// Etapa 3: aplica parseRichText às páginas
const pages = fixedRawPages.map(parseRichText);

// Controle de página
let currentPage = 0;

function renderPage() {
    textArea.innerHTML = pages[currentPage];
    if (!document.getElementById("page-indicator")) {
        const indicator = document.createElement("div");
        indicator.id = "page-indicator";
        indicator.className = "page-indicator";
        document.querySelector(".card").appendChild(indicator);
    }
}

function nextPage() {
    currentPage = (currentPage + 1) % pages.length;
    renderPage();
}

const textarea = document.querySelector(".text-area");
if (pages.length > 1) {
    textarea.classList.add("clickable");
} else {
    textarea.classList.remove("clickable");
}

window.nextPage = nextPage;

// Inicializa página 1
renderPage();
