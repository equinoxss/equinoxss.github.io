let cardTime = 120000;
let blackTime = 60000;
const bellTime = 2000;

let audio = null;
let customCardListBuilt = false;
let customImgElement = null;
let customImgChosen = null;
let desireHandlersBound = false;

let segments = [];
const singles = [ 'imgs/square/land.jpg', 'imgs/square/water.jpg', 'imgs/square/fire.jpg', 'imgs/square/wind.jpg', 'imgs/square/ether.jpg' ];
const decks = {
  land: { i: 'imgs/square/land.jpg', c: [ 'imgs/square/land.jpg', 'imgs/square/land-water.jpeg', 'imgs/square/land-fire.jpeg', 'imgs/square/land-wind.jpeg', 'imgs/square/land-ether.jpeg' ] },
  water: { i: 'imgs/square/water.jpg', c: [ 'imgs/square/water.jpg', 'imgs/square/water-land.jpeg', 'imgs/square/water-fire.jpeg', 'imgs/square/water-wind.jpeg', 'imgs/square/water-ether.jpeg' ] },
  fire: { i: 'imgs/square/fire.jpg', c: [ 'imgs/square/fire.jpg', 'imgs/square/fire-land.jpeg', 'imgs/square/fire-water.jpeg', 'imgs/square/fire-wind.jpeg', 'imgs/square/fire-ether.jpeg' ] },
  wind: { i: 'imgs/square/wind.jpg', c: [ 'imgs/square/wind.jpg', 'imgs/square/wind-land.jpeg', 'imgs/square/wind-water.jpeg', 'imgs/square/wind-fire.jpeg', 'imgs/square/wind-ether.jpeg' ] },
  ether: { i: 'imgs/square/ether.jpg', c: [ 'imgs/square/ether.jpg', 'imgs/square/ether-land.jpeg', 'imgs/square/ether-water.jpeg', 'imgs/square/ether-fire.jpeg', 'imgs/square/ether-wind.jpeg' ] },
};

function start() {
  audio = new Audio();
  audio.autoplay = true;

  playSilent();
  buildSegments();
  prepare();
  next();
}

function prepare() {
  viewer.classList.add('show');
  document.querySelector('body').classList.add('no-scroll');
  document.querySelector('body').requestFullscreen();
  document.querySelector('#blackBkgd').checked || viewer.classList.add('gray');
}

function done() {
  viewer.classList.remove('show','cover','inset','gray');
  document.querySelector('body').classList.remove('no-scroll');
  document.exitFullscreen();
}

function buildSegments() {
  segments = [];

  segments.push({ i: 'imgs/count-3.jpeg', t: 675 });
  segments.push({ i: 'imgs/count-2.jpeg', t: 675 });
  segments.push({ i: 'imgs/count-1.jpeg', t: 675 });

  cardTime = document.querySelector('#cardTime').value * 60000;
  blackTime = document.querySelector('#vizTime').value * 60000;

  customChosen.filter(img => !!img).map(img => {
    if (img.endsWith('breath-btn.jpeg')) {
      addBreathSegments(true);
    } else {
      segments.push({ i: img, t: cardTime });
      segments.push({ t: blackTime, b: true });
    }
  });
  
  segments.push({ done: true });
}

function addBreathSegments(addBlack) {
  const bTime = document.querySelector('#breathTime').value;
  const sTime = document.querySelector('#sessionTime').value;
  const square = document.querySelector('#squareBreathing').checked;

  const cycles = Math.ceil( (sTime * 60) / ((square ? 4 : 2) * bTime) );

  for (let i=0;i<cycles;i++) {
    segments.push({ i: 'imgs/breath/breath-up.jpeg', t: bTime * 1000, s: 'sounds/inhale.mp3' });
    square && segments.push({ i: 'imgs/breath/breath-up-hold.jpeg', t: bTime * 1000, s: 'sounds/bell2.mp3'  });
    segments.push({ i: 'imgs/breath/breath-down.jpeg', t: bTime * 1000, s: 'sounds/exhale.mp3'  });
    square && segments.push({ i: 'imgs/breath/breath-down-hold.jpeg', t: bTime * 1000, s: 'sounds/bell2.mp3'  });
  }
  
  if (addBlack) {
    segments.push({ t: bTime * 1000, b: true });
  }
}

let currentSegment = null;
let currentStart = 0;
let timers = [];
let viewerPaused = false;

function next() {
  try {
    currentSegment = segments.shift();

    viewer.style.backgroundImage = currentSegment.i ? `url(${currentSegment.i})` : null;

    timers = [];
    currentStart = Date.now();

    currentSegment.t && timers.push( setTimeout(() => next(), currentSegment.t) );
    currentSegment.b && timers.push( setTimeout(() => playChime(), Math.max(0, currentSegment.t - 1000)) );
    currentSegment.s && playSound(currentSegment.s);
    currentSegment.done && done();
  } catch(e) {
    exitMeditation();
  }
}

function exitMeditation() {
  timers.forEach(t => clearTimeout(t));
  viewer.style.backgroundImage = null;
  done();
}

function playSilent() {
  audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
}

function playChime() {
  audio.src = 'sounds/bell2.mp3';

  setTimeout(() => playSilent(), bellTime);
}

function playSound(sound) {
  audio.src = sound;
}

function updateSelectedDeck() {
  deckButtons.forEach( btn => btn.classList.remove('selected') );

  if (typeChosen === 'd') {
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
      const cards = decks[key].c.map(path => `<img src="${path}" draggable="true" ondragstart="drag(event)" onclick="selectCustomImg(event)" />`);
      return acc.concat(cards);
    }, []);

    imgs.push('<img src="imgs/square/commun-S3.jpg" draggable="true" ondragstart="drag(event)" onclick="selectCustomImg(event)" />');
    imgs.push('<img src="imgs/breath/breath-btn.jpeg" draggable="true" ondragstart="drag(event)" onclick="selectCustomImg(event)" />');

    customGroup.querySelector('.card-list').innerHTML = imgs.join('');
  }
}

function renderCustomSequence() {
  let hasBreath = false;

  const cards = customChosen.map((img,idx) => {
    hasBreath |= img.endsWith('breath-btn.jpeg');

    return `
      <div class="custom-slot" data-idx="${idx}" 
          ondragover="dragOver(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)" ondrop="drop(event,${idx})"
          onmouseenter="mouseEnter(event,${idx})" onmouseleave="mouseLeave(event)" onclick="placeCustomImg(event, ${idx})">
        <img src="${img}">
        <div class="remove-img hidden" onclick="clearCustomCard(event,${idx})">&times;</div>
      </div>`
  });

  hasBreath 
    ? breathTime.classList.remove('hidden')
    : breathTime.classList.add('hidden');

  customGroup.querySelector('.chosen-cards').innerHTML = cards.join('');
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.src);
}

function selectCustomImg(ev) {
  clearCustomImgSelection();
  if (customImgChosen !== ev.target.src) {
    customImgChosen = ev.target.src;
    ev.target.classList.toggle('selected');
  } else {
    customImgChosen = null;
  }
}

function clearCustomImgSelection() {
  customGroup.querySelectorAll('.card-list img').forEach( img => img.classList.remove('selected'));
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

function placeCustomImg(ev, idx) {
  ev.preventDefault();
  if (customImgChosen) {
    customChosen[idx] = customImgChosen;
    customImgChosen = null;
    clearCustomImgSelection();
    renderCustomSequence();
  }
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

const deckButtons = document.querySelectorAll('.radio-buttons.deck .radio');
const sequenceTime = document.querySelector('.card-time.sequence');
const breathTime = document.querySelector('.card-time.breath');
const deckGroup = document.querySelector('.group.deck');
const customGroup = document.querySelector('.group.custom');
const viewer = document.querySelector('.viewer');
const playButton = document.querySelector('#playButton');

const onMobile = window.innerWidth <= 512;
let typeChosen = 'c';
let deckChosen = 'land';
const pairChosen = [];
const customChosen =  onMobile ? ['','','','',''] : ['','','','','',''];

customGroup.classList.remove('hidden');
addCustomCards();
renderCustomSequence();

let clickTime = -600;
let clickWatcher = null;
viewer.addEventListener('click', ev => {
  if (viewerPaused) {
    resume();
  } else {
    clickWatcher && clearTimeout(clickWatcher);

    if (ev.timeStamp - clickTime < 600) {
      exitMeditation();
    } else {
      clickWatcher = setTimeout(() => pause(), 1000);
    }
    
    clickTime = ev.timeStamp;
  }
});

document.querySelector('#cardTime').value = cardTime / 60000;
document.querySelector('#vizTime').value = blackTime / 60000;
document.querySelector('#breathTime').value = 4;
document.querySelector('#sessionTime').value = 3;

const addCustom = document.querySelector('.add-custom');
onMobile && (addCustom.innerText = '+');