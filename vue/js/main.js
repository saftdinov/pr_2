// Данные приложения
let kolonki = {
    sdelat: [],
    vprocesse: [],
    gotovo: []
};
let zablokirovano = false;

// Элементы страницы
const spiski = {
    sdelat: document.getElementById('todo-list'),
    vprocesse: document.getElementById('progress-list'),
    gotovo: document.getElementById('done-list')
};

const schetchiki = {
    sdelat: document.getElementById('todo-count'),
    vprocesse: document.getElementById('progress-count'),
    gotovo: document.getElementById('done-count')
};

const knopkaDobavit = document.getElementById('add-card-btn');
const modalnoeOkno = document.getElementById('card-modal');
const forma = document.getElementById('card-form');
const poleZagolovka = document.getElementById('card-title');
const konteinerPunktov = document.getElementById('items-container');
const knopkaPunkt = document.getElementById('add-item-btn');
const knopkaZakrit = document.getElementById('close-modal');
const knopkaOtmena = document.getElementById('cancel-btn');
const perekritie = document.getElementById('todo-locked');

// Загружаем данные при старте
zagruzit();

// Обработчики кнопок
knopkaDobavit.onclick = function() {
    if (!zablokirovano && kolonki.sdelat.length < 3) {
        poleZagolovka.value = '';
        konteinerPunktov.innerHTML = '<input type="text" placeholder="1" required><input type="text" placeholder="2" required><input type="text" placeholder="3" required>';
        modalnoeOkno.style.display = 'flex';
    }
};

knopkaZakrit.onclick = knopkaOtmena.onclick = function() {
    modalnoeOkno.style.display = 'none';
};

knopkaPunkt.onclick = function() {
    if (konteinerPunktov.children.length < 5) {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = konteinerPunktov.children.length + 1;
        input.required = true;
        konteinerPunktov.appendChild(input);
    }
};

// Создание новой карточки
forma.onsubmit = function(e) {
    e.preventDefault();
    let zagolovok = poleZagolovka.value.trim();
    let vseInput = konteinerPunktov.querySelectorAll('input');
    let punkti = Array.from(vseInput).map(i => i.value.trim()).filter(v => v);

    if (puknti.length < 3) {
        alert('Нужно минимум 3 пункта!');
        return;
    }

    kolonki.sdelat.push({
        id: Date.now(),
        zagolovok: zagolovok,
        punkti: punkti.map(p => ({ text: p, gotovo: false })),
        dataZaversheniya: null
    });

    sohranit();
    pokazatKartochki();
    obnovitSchetchiki();
    modalnoeOkno.style.display = 'none';
};

// Обработка чекбокса
function obrabotatChek(id, index, vklucheno) {
    let kartochka = null;
    let kolonka = null;

    for (let k in kolonki) {
        let idx = kolonki[k].findIndex(x => x.id === id);
        if (idx !== -1) {
            kartochka = kolonki[k][idx];
            kolonka = k;
            break;
        }
    }

    if (!kartochka) return;

    kartochka.punkti[index].gotovo = vklucheno;

    let gotovo = kartochka.punkti.filter(p => p.gotovo).length;
    let vsego = kartochka.punkti.length;
    let procent = Math.round((gotovo / vsego) * 100);

    if (kolonka === 'sdelat' && procent > 50) {
        if (kolonki.vprocesse.length < 5) {
            peremestit('vprocesse', id);
        } else {
            kartochka.punkti[index].gotovo = !vklucheno;
            zablokirovat();
        }
    }

    if (kolonka === 'vprocesse' && procent === 100) {
        peremestit('gotovo', id);
        kartochka.dataZaversheniya = new Date().toLocaleString();
        razblokirovat();
    }

    sohranit();
    pokazatKartochki();
    obnovitSchetchiki();
}

// Переместить карточку
function peremestit(vKolonku, id) {
    let kartochka = null;
    for (let k in kolonki) {
        let idx = kolonki[k].findIndex(x => x.id === id);
        if (idx !== -1) {
            kartochka = kolonki[k][idx];
            kolonki[k].splice(idx, 1);
            break;
        }
    }
    if (kartochka) kolonki[vKolonku].push(kartochka);
}

// Блокировка колонки
function zablokirovat() {
    zablokirovano = true;
    perekritie.style.display = 'flex';
    knopkaDobavit.disabled = true;
    sohranit();
}

function razblokirovat() {
    if (kolonki.vprocesse.length < 5) {
        zablokirovano = false;
        perekritie.style.display = 'none';
        knopkaDobavit.disabled = false;
        sohranit();
    }
}

// Показать все карточки
function pokazatKartochki() {
    spiski.sdelat.innerHTML = '';
    spiski.vprocesse.innerHTML = '';
    spiski.gotovo.innerHTML = '';

    kolonki.sdelat.forEach(k => narisovatKartochku(k, 'sdelat'));
    kolonki.vprocesse.forEach(k => narisovatKartochku(k, 'vprocesse'));
    kolonki.gotovo.forEach(k => narisovatKartochku(k, 'gotovo'));
}

function narisovatKartochku(kartochka, kolonka) {
    let div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <div class="card-title">${kartochka.zagolovok}</div>
        <ul class="card-items">
            ${kartochka.punkti.map((p, i) => `
                <li class="card-item">
                    <input type="checkbox" data-id="${kartochka.id}" data-idx="${i}" ${p.gotovo ? 'checked' : ''}>
                    <label>${p.text}</label>
                </li>
            `).join('')}
        </ul>
        ${kolonka === 'gotovo' && kartochka.dataZaversheniya ? `<div class="completion-date">Завершено: ${kartochka.dataZaversheniya}</div>` : ''}
    `;

    spiski[kolonka].appendChild(div);

    div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.onchange = function(e) {
            let id = parseInt(e.target.dataset.id);
            let idx = parseInt(e.target.dataset.idx);
            obrabotatChek(id, idx, e.target.checked);
        };
    });
}

// Обновить счетчики
function obnovitSchetchiki() {
    schetchiki.sdelat.textContent = `${kolonki.sdelat.length}/3`;
    schetchiki.vprocesse.textContent = `${kolonki.vprocesse.length}/5`;
    schetchiki.gotovo.textContent = `${kolonki.gotovo.length}`;

    if (kolonki.sdelat.length >= 3 || zablokirovano) {
        knopkaDobavit.disabled = true;
    } else {
        knopkaDobavit.disabled = false;
    }
}

// Сохранение в память браузера
function sohranit() {
    localStorage.setItem('zametki', JSON.stringify({ kolonki, zablokirovano }));
}

function zagruzit() {
    let sohranennie = localStorage.getItem('zametki');
    if (sohranennie) {
        let dannie = JSON.parse(sohranennie);
        kolonki = dannie.kolonki || { sdelat: [], vprocesse: [], gotovo: [] };
        zablokirovano = dannie.zablokirovano || false;
    }
    pokazatKartochki();
    obnovitSchetchiki();
    proveritBlokirovku();
}

function proveritBlokirovku() {
    if (kolonki.vprocesse.length >= 5) {
        let estLi = kolonki.sdelat.some(k => {
            let gotovo = k.punkti.filter(p => p.gotovo).length;
            return (gotovo / k.punkti.length) > 0.5;
        });
        if (estLi) zablokirovat();
    }
}

// Закрыть модальное окно при клике вне его
window.onclick = function(e) {
    if (e.target === modalnoeOkno) modalnoeOkno.style.display = 'none';
};