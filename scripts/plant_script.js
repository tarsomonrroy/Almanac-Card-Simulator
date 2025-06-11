// --- Helpers de formatação e paginação (iguais aos anteriores) ---
function parseRichText(text) {
    const baseSize = -13;
    return text
        .replace(/<size=(\d+)>/g, (_, s) => {
            const totalSize = baseSize + parseInt(s);
            return `<span style="font-size:${totalSize}px">`;
        })
        .replace(/<\/size>/g, '</span>')
        .replace(/<color=([#\w]+)>/g, (_, c) => `<span style="color:${c}">`)
        .replace(/<\/color>/g, '</span>');
}

function splitStyledText(text, maxHeight, container) {
    const measurer = document.createElement('div');
    Object.assign(measurer.style, {
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: 'pre-wrap',
        width: getComputedStyle(container).width,
        fontSize: getComputedStyle(container).fontSize,
        lineHeight: getComputedStyle(container).lineHeight,
        fontFamily: getComputedStyle(container).fontFamily
    });
    document.body.appendChild(measurer);

    const pages = [];
    const words = text.split(/(?=\s)|(?<=\s)/);

    let current = '';
    for (let i = 0; i < words.length; i++) {
        current += words[i];
        measurer.innerHTML = parseRichText(current);
        if (measurer.scrollHeight > maxHeight) {
            // backtrack última palavra
            const fallback = current.split(/(?=\s)|(?<=\s)/);
            const last = fallback.pop();
            pages.push(fallback.join('').trim());
            const rest = last + words.slice(i + 1).join('');
            document.body.removeChild(measurer);
            return pages.concat(
                splitStyledText(rest.trim(), maxHeight, container)
            );
        }
    }
    if (current.trim()) pages.push(current.trim());
    document.body.removeChild(measurer);
    return pages;
}

// mantém tags abertas
function extractOpenCustomTags(raw) {
    const stack = [];
    const re = /<color=[^>]+>|<size=\d+>|<\/color>|<\/size>/g;
    let m;
    while ((m = re.exec(raw))) {
        const tag = m[0];
        if (tag.startsWith('<color=') || tag.startsWith('<size=')) {
            stack.push(tag);
        } else {
            const kind = tag === '</color>' ? 'color' : 'size';
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].startsWith(`<${kind}`)) {
                    stack.splice(i, 1);
                    break;
                }
            }
        }
    }
    return stack.join('');
}

// --- Variáveis de estado ---
let plants = [];
let currentPlantIndex = 0;
let pages = [];
let currentPage = 0;

// referências no DOM
const titleEl = document.getElementById('title');
const textArea = document.getElementById('text');
const costEl = document.getElementById('cost');

// --- Funções de renderização ---
function paginateCurrentPlant() {
    const json = plants[currentPlantIndex];
    const combined = json.info + '\n\n' + json.introduce;
    const adjustment = 10;
    const maxH = textArea.clientHeight - adjustment;

    const raw = splitStyledText(combined, maxH, textArea);
    const fixed = [];

    for (let i = 0; i < raw.length; i++) {
        if (i === 0) {
            fixed.push(raw[i]);
        } else {
            const prev = fixed[i - 1] || raw[i - 1];
            const openTags = extractOpenCustomTags(prev);
            fixed.push(openTags + raw[i]);
        }
    }

    pages = fixed.map(parseRichText);
    currentPage = 0;
}


function renderPlant() {
    const json = plants[currentPlantIndex];
    // título e ID
    titleEl.innerHTML =
        json.name.replace(/<[^>]+>/g, '') + ' (' + json.seedType + ')';
    // custo
    costEl.innerHTML = parseRichText(json.cost);
    // paginação de texto
    paginateCurrentPlant();
    renderPage();

    localStorage.setItem('lastPlantId', plants[currentPlantIndex].seedType);
}

function renderPage() {
    textArea.innerHTML = pages[currentPage];
    // ativa cursor somente se >1 página
    textArea.style.cursor = pages.length > 1 ? 'pointer' : 'default';
}

function nextPage() {
    if (pages.length <= 1) return;
    currentPage = (currentPage + 1) % pages.length;
    renderPage();
}

// --- Navegação de plantas ---
function prevPlant() {
    currentPlantIndex =
        (currentPlantIndex - 1 + plants.length) % plants.length;
    renderPlant();
}

function nextPlant() {
    currentPlantIndex = (currentPlantIndex + 1) % plants.length;
    renderPlant();
}

function goToId() {
    const id = parseInt(document.getElementById('chooseId').value, 10);
    const idx = plants.findIndex((p) => p.seedType === id);
    if (idx >= 0) {
        currentPlantIndex = idx;
        renderPlant();
    } else {
        const msg = document.getElementById('errorMsg');
        msg.classList.remove('hidden');
        msg.classList.add('visible');

        setTimeout(() => {
            msg.classList.remove('visible');
            msg.classList.add('hidden');
        }, 3000);
    }
}

function errormessage() {
    const msg = document.getElementById('errorMsg');
    msg.classList.remove('hidden');
    msg.classList.add('visible');
    setTimeout(() => {
        msg.classList.remove('visible');
        msg.classList.add('hidden');
    }, 3000);
}

// --- Wire-up dos botões ---
document.getElementById('prevPlant').onclick = prevPlant;
document.getElementById('nextPlant').onclick = nextPlant;
document.getElementById('goToId').onclick = goToId;

document.getElementById('chooseId').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // previne envio de form, se houver
        this.blur();
        goToId();
    }
});

window.nextPage = nextPage; // para onclick direto na div

// --- Carrega o JSON e inicializa ---
fetch('../data/LawnStrings.json')
    .then((res) => res.json())
    .then((data) => {
        plants = data.plants;

        const lastId = parseInt(localStorage.getItem('lastPlantId'), 10);
        const foundIndex = plants.findIndex(p => p.seedType === lastId);

        currentPlantIndex = foundIndex >= 0 ? foundIndex : 0;
        renderPlant();
    })
    .catch((err) => {
        console.error('Erro ao carregar JSON:', err);
        errormessage();
    });