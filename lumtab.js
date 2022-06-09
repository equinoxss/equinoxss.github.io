let cardTime = 120000;
let blackTime = 180000;
const bellTime = 2000;

let audio = null;
let customCardListBuilt = false;

let segments = [];
const singles = [ 'imgs/land.jpg', 'imgs/water.jpg', 'imgs/fire.jpg', 'imgs/wind.jpg', 'imgs/ether.jpg' ];
const decks = {
  land: { i: 'imgs/land.jpg', c: [ 'imgs/land.jpg', 'imgs/land-water.jpeg', 'imgs/land-fire.jpeg', 'imgs/land-wind.jpeg', 'imgs/land-ether.jpeg' ] },
  water: { i: 'imgs/water.jpg', c: [ 'imgs/water.jpg', 'imgs/water-land.jpeg', 'imgs/water-fire.jpeg', 'imgs/water-wind.jpeg', 'imgs/water-ether.jpeg' ] },
  fire: { i: 'imgs/fire.jpg', c: [ 'imgs/fire.jpg', 'imgs/fire-land.jpeg', 'imgs/fire-water.jpeg', 'imgs/fire-wind.jpeg', 'imgs/fire-ether.jpeg' ] },
  wind: { i: 'imgs/wind.jpg', c: [ 'imgs/wind.jpg', 'imgs/wind-land.jpeg', 'imgs/wind-water.jpeg', 'imgs/wind-fire.jpeg', 'imgs/wind-ether.jpeg' ] },
  ether: { i: 'imgs/ether.jpg', c: [ 'imgs/ether.jpg', 'imgs/ether-land.jpeg', 'imgs/ether-water.jpeg', 'imgs/ether-fire.jpeg', 'imgs/ether-wind.jpeg' ] },
};

function start() {
  if (typeChosen !== 'p' || pairChosen.length === 2) {
    audio = new Audio();
    audio.autoplay = true;

    playSilent();
    buildSegments();
    prepare();
    next();
  }
}

function prepare() {
  document.querySelector('.black').classList.add('show');
  document.querySelector('body').classList.add('no-scroll');
}

function done() {
  document.querySelector('.black').classList.remove('show');
  document.querySelector('body').classList.remove('no-scroll');
}

function buildSegments() {
  segments = [];

  segments.push({ i: 'imgs/count-3.jpeg', t: 750 });
  segments.push({ i: 'imgs/count-2.jpeg', t: 750 });
  segments.push({ i: 'imgs/count-1.jpeg', t: 750 });

  if (typeChosen === 'b') {
    const bTime = document.querySelector('#breathTime').value;
    const sTime = document.querySelector('#sessionTime').value;
    const cycles = Math.ceil( (sTime * 60) / (2 * bTime) );

    for (let i=0;i<cycles;i++) {
      segments.push({ i: 'imgs/breath-up.jpeg', t: bTime * 1000 });
      segments.push({ i: 'imgs/breath-down.jpeg', t: bTime * 1000 });
    }
  } else {
    cardTime = document.querySelector('#cardTime').value * 60000;
    blackTime = document.querySelector('#vizTime').value * 60000;

    if (typeChosen === 'c') {
      customChosen.filter(img => !!img).map(img => {
        segments.push({ i: img, t: cardTime });
        segments.push({ t: blackTime, b: true });
      });
    } else if (typeChosen === 'o') {
      segments.push({ i: decks[deckChosen].i, t: cardTime });
      segments.push({ t: blackTime, b: true });

    } else if (typeChosen !== 'p') {
      const images = typeChosen === 's' ? singles : decks[deckChosen].c;

      images.forEach(img => {
        segments.push({ i: img, t: cardTime });
        segments.push({ t: blackTime, b: true });
      });

      segments.push({ i: 'imgs/commun.jpg', t: cardTime });
      segments.push({ t: blackTime, b: true });
    } else {
      segments.push({ i: `imgs/${pairChosen[0]}-${pairChosen[1]}.jpeg`, t: cardTime });
      segments.push({ t: blackTime, b: true });
      segments.push({ i: `imgs/${pairChosen[1]}-${pairChosen[0]}.jpeg`, t: cardTime });
      segments.push({ t: blackTime, b: true });
    }
  }

  segments.push({ done: true });
}

function next() {
  const el = document.querySelector('.black');
  const s = segments.shift();

  el.style.backgroundImage = s.i ? `url(${s.i})` : null;

  s.t && setTimeout(() => next(), s.t);
  s.b && setTimeout(() => playChime(), s.t - 1000);
  s.done && done();
}

function playSilent() {
  audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
}

function playChime() {
  audio.src = 'sounds/bell2.mp3';

  setTimeout(() => playSilent(), bellTime);
}

function updateSelectedDeck() {
  deckButtons.forEach( btn => btn.classList.remove('selected') );

  if (typeChosen === 'd' || typeChosen === 'o') {
    selectDeck.querySelector(`.radio[data-id=${deckChosen}]`).classList.add('selected');
  } else if (typeChosen === 'p') {
    if (pairChosen[0]) {
      selectDeck.querySelector(`.radio[data-id=${pairChosen[0]}]`).classList.add('selected');
      if (pairChosen[1]) {
        selectDeck.querySelector(`.radio[data-id=${pairChosen[1]}]`).classList.add('selected');
      }
    }
  }
}

function addCustomCards() {
  if (!customCardListBuilt) {
    customCardListBuilt = true;
    const imgs = Object.keys(decks).reduce( (acc, key) => {
      const cards = decks[key].c.map(path => `<img src="${path}" draggable="true" ondragstart="drag(event)" />`);
      return acc.concat(cards);
    }, []);

    imgs.push('<img src="imgs/commun.jpg" draggable="true" ondragstart="drag(event)" />');
    // imgs.push('<img src="imgs/breath-up.jpeg" draggable="true" ondragstart="drag(event)" />');
    // imgs.push('<img src="imgs/breath-down.jpeg" draggable="true" ondragstart="drag(event)" />');

    customGroup.querySelector('.card-list').innerHTML = imgs.join('');
  }
}

function renderCustomSequence() {
  const cards = customChosen.map((img,idx) => `
      <div class="custom-slot" data-idx="${idx}" 
          ondragover="dragOver(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)" ondrop="drop(event,${idx})"
          onmouseenter="mouseEnter(event,${idx})" onmouseleave="mouseLeave(event)">
        <img src="${img}">
        <div class="remove-img hidden" onclick="clearCustomCard(event,${idx})">&times;</div>
      </div>`);

  customGroup.querySelector('.chosen-cards').innerHTML = cards.join('');
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.src);
}

function dragOver(ev) {
  ev.preventDefault();
}

function dragEnter(ev) {
  ev.preventDefault();
  ev.target.classList.add('active-drop');
}

function dragLeave(ev) {
  ev.preventDefault();
  ev.target.classList.remove('active-drop');
}

function drop(ev,idx) {
  ev.preventDefault();
  customChosen[idx] = ev.dataTransfer.getData("text");
  renderCustomSequence();
}

function mouseEnter(ev,idx) {
  if (customChosen[idx]) {
    ev.target.querySelector('.remove-img').classList.remove('hidden');
  }
}

function mouseLeave(ev) {
  ev.target.querySelector('.remove-img').classList.add('hidden');
}

function clearCustomCard(ev,idx) {
  customChosen[idx] = '';
  renderCustomSequence();
}

function addCustomCard() {
  customChosen.push('');
  renderCustomSequence();
}

const ctas = {
  d: 'Choose a Deck',
  p: 'Choose Two Cards to Pair',
  o: 'Choose One Card',
  c: 'Choose a Deck',
};

const countButtons = document.querySelectorAll('.radio-buttons.count .radio')
const deckButtons = document.querySelectorAll('.radio-buttons.deck .radio');
const selectDeck = document.querySelector('#select-deck');
const sequenceTime = document.querySelector('.card-time.sequence');
const breathTime = document.querySelector('.card-time.breath');
const deckGroup = document.querySelector('.group.deck');
const customGroup = document.querySelector('.group.custom');

let typeChosen = 's';
let deckChosen = 'land';
const pairChosen = [];
const customChosen = ['','','','','',''];


for (const radioButton of countButtons) {
  radioButton.addEventListener('click', evt => {
    const newVal = evt.target.dataset.id;
    if (newVal !== typeChosen) {
      typeChosen = newVal;

      if (typeChosen === 's' || typeChosen === 'b') {
        selectDeck.classList.add('dimmed');
      } else if (typeChosen === 'c') {
        addCustomCards();
        renderCustomSequence();
      } else {
        selectDeck.classList.remove('dimmed');
        selectDeck.querySelector('div:first-child').innerText = ctas[typeChosen];
        updateSelectedDeck();
      }

      if (typeChosen === 'b') {
        sequenceTime.classList.add('hidden');
        breathTime.classList.remove('hidden');
      } else {
        sequenceTime.classList.remove('hidden');
        breathTime.classList.add('hidden');
      }

      if (typeChosen === 'c') {
        deckGroup.classList.add('hidden');
        customGroup.classList.remove('hidden');
      } else {
        deckGroup.classList.remove('hidden');
        customGroup.classList.add('hidden');
      }

      countButtons.forEach( btn => btn.classList.remove('selected') );
      evt.target.classList.add('selected');
    }
  });
}

for (const radioButton of deckButtons) {
  radioButton.addEventListener('click', evt => {
    const newVal = evt.target.dataset.id;
    if (typeChosen === 'd' || typeChosen === 'o') {
      if (newVal !== deckChosen) {
        deckChosen = newVal;
      }
    } else if (typeChosen === 'p') {
      const idx = pairChosen.indexOf(newVal);
      if (idx >= 0) {
        pairChosen.splice(idx,1);
      } else if (pairChosen.length < 2) {
        pairChosen.push(newVal);
      }
    }

    updateSelectedDeck();
  });
}

document.querySelector('#cardTime').value = cardTime / 60000;
document.querySelector('#vizTime').value = blackTime / 60000;
document.querySelector('#breathTime').value = 4;
document.querySelector('#sessionTime').value = cardTime / 60000;
