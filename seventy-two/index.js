let selected = null;
let ibound = false;
let mbound = false;
let sbound = false;
let pbound = false;
let names = [];
let orientation = 'portrait';
let footerItems = [];
let audio = null;

function initApp() {
  document.querySelector('#settings2').addEventListener('click', () => settings());
  document.querySelector('#study2').addEventListener('click', () => study());
  document.querySelector('#abk2').addEventListener('click', () => abk());
  document.querySelector('#previous2').addEventListener('click', () => previous());
  document.querySelector('#home2').addEventListener('click', () => home());
  document.querySelector('#meditate2').addEventListener('click', () => meditate());
  document.querySelector('#next2').addEventListener('click', () => next());
  document.querySelector('#back2').addEventListener('click', () => back());

  document.querySelectorAll('.footer [data-abk-day').forEach( dayBtn => {
    dayBtn.addEventListener('click', evt => {
      abk( Number(evt.target.dataset.abkDay) );
    });
  });

  document.querySelector('#playSong').addEventListener('click', () => playAbkSong());
  document.querySelector('#playSpeak').addEventListener('click', () => playAbkSpeak());

  footerItems = document.querySelectorAll('.footer.agg [data-page]');
  setFont();

  audio = new Audio();
  audio.autoplay = true;
}

function initOrientation() {
  orientation = window.innerWidth < window.innerHeight ? 'portait' : 'landscape';

  const mql = window.matchMedia("(orientation: portrait)");
  mql.addListener(m => {
    orientation = m.matches ? 'portait' : 'landscape';
    calculateSizes();
    initTable();
  });  
}

function initTable() {
  const data = getNamesData();
  names = orientation === 'portait'
            ? data.sort((a,b) => a.ppos - b.ppos)
            : data.sort((a,b) => a.lpos - b.lpos);

  const el = document.querySelector('.page .names-table');
  const cells = names.map(cell => `
    <div class="name-cell hebrew-name small" data-id="${cell.id}">${cell.nameHb}<div class="name-number">${cell.id}</div></div>
  `);

  el.innerHTML = cells.join('');

  el.addEventListener('click', event => {
    document.querySelector('.page.info').classList.remove('hidden');
    showFooterFor('info');
    showInfo(Number(event.target.dataset.id));
  });
}

function calculateSizes() {
  const el = document.querySelector('style#custom');
  el && el.remove();

  const element = document.createElement('style');
  element.id = 'custom';
  document.head.appendChild(element);
  const sheet = element.sheet;

  let w = window.innerWidth;
  let h = window.innerHeight;

  if (w > h) {
    orientation = 'landscape';
    w = w / 2;
    h = h - 50;
  } else {
    h = (h - 50) / 2;
  }

  // sheet.insertRule(`
  //   .column {
  //     width: ${w}px;
  //     height: ${h}px;
  //   }
  // `);

  const ch = Math.floor((h-20)/9); // 20px for borders
  sheet.insertRule(`
    .name-cell {
      height: ${ch}px;
      line-height: ${ch}px;
    }
  `);
}

function bindPageElements() {
  document.querySelector('#meditate-now').addEventListener('click', () => startMeditation());
  document.querySelector('#study-now').addEventListener('click', () => startStudy());
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('click', chooseFont));
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('mousedown', ev => ev.target.classList.add('pressed')));
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('mouseup', ev => ev.target.classList.remove('pressed')));
}

function bindElements() {
  ibound = true;
}

function showInfo(id) {
  !ibound && bindElements();

  selected = names.find( n => n.id === id);
  setBoundFields('info');
  addFontId(document.querySelector('.page.info .hebrew-name'));
}

function addFontId(el) {
  el.classList.remove('std','ash','sef','pro','pal')
  el.classList.add(fontId);
}

function setBoundFields(page) {
  const fields = document.querySelectorAll(`.page.${page} [data-bind]`);
  fields.forEach( field => {
    if (field.nodeName == 'DIV') {
      const computed = field.dataset.bind.startsWith(":");
      const propName = String(field.dataset.bind).replace(':','');
      const { text, cssClass } = computed
        ? computeBoundValue(propName, selected[propName])
        : { text: selected[propName] };
      field.innerText = text;
      field.dataset.extraClasses && (field.classList.remove(field.dataset.extraClasses), delete field.dataset.extraClasses);
      cssClass && (field.classList.add(cssClass), field.dataset.extraClasses = cssClass);
    } else if (field.nodeName === 'IMG') {
      field.src = selected[field.dataset.bind];
    }
  });
}

function computeBoundValue(fieldname, text) {
  let cssClass = null;

  if (fieldname === 'meditationEn') {
    cssClass = text.length > 280 ? 'long' : null;
  }

  return { cssClass, text };
}

function home() {
  document.querySelector('.page.info').classList.add('hidden');
  showFooterFor('names');
}

function previous() {
  showInfo( Math.max(selected.id - 1, 1) );
}

function next() {
  showInfo( Math.min(selected.id + 1, 72) );
}

function back() {
  // document.querySelector('.footer.back').classList.add('hidden');
  showFooterFor('names');
  document.querySelectorAll('.page:not(.hidden').forEach( page => {
    if (!page.classList.contains('names')) {
      page.classList.add('hidden');
    }
  });
}

function meditate() {
  document.querySelector('.page.meditate').classList.remove('hidden');
  addFontId(document.querySelector('.page.meditate .hebrew-name'));
  document.querySelector('.page.meditate-time').classList.remove('hidden');
  showFooterFor('meditate');

  if (!mbound) {
    mbound = true;
    const freqButtons = document.querySelector('#meditate-frequency');
    document.querySelector('#meditate-mode').addEventListener('change', ev => {
      ev.target.checked
        ? freqButtons.classList.remove('hidden')
        : freqButtons.classList.add('hidden');
    })

    const options = freqButtons.querySelectorAll('.option');
    options.forEach( opt => {
      opt.addEventListener('click', ev => {
        if (!ev.target.classList.contains('selected')) {
          options.forEach( el => el.classList.remove('selected'));
          ev.target.classList.add('selected');
        }
      });
    });
  }

  bindMeditateAbort();
  // bindBackButton();
}

function bindMeditateAbort() {
  if (!pbound) {
    pbound = true;

    let clickTime = -600;
    document.querySelector('.page .meditate-wrap').addEventListener('click', ev => {
      if (ev.timeStamp - clickTime < 600) {
        endMeditation();
      }
      clickTime = ev.timeStamp;
    });
  }
}

let mtid = 0;
let returnPage = '';

function startMeditation() {
  document.querySelector('body').requestFullscreen();
  document.querySelector('.page.meditate-time').classList.add('hidden');
  showFooterFor('fullscreen');
  setBoundFields('meditate');
  returnPage = 'info';

  const ms = Number(document.querySelector('#meditate-time').value) * 1000;
  const fm = document.querySelector('#meditate-mode').checked;
  const fq = Number(document.querySelector('#meditate-frequency .option.selected').dataset.value);
  
  if (fm) {
    setFlashFrequency(fq);
    document.querySelector('.page.meditate').classList.add('flash');
    mtid = setTimeout(done, ms);

  } else {
    mtid = setTimeout(() => {
      // black
      document.querySelector('.page.meditate').classList.add('invert');
      document.querySelector('.page.meditate').classList.add('black');

      mtid = setTimeout(() => {
        // inverted
        document.querySelector('.page.meditate').classList.remove('black');

        mtid = setTimeout(() => {
          // black
          document.querySelector('.page.meditate').classList.add('white');
      
          mtid = setTimeout(() => {
            // done
            endMeditation();
          }, ms);
        }, ms);
      }, ms);
    }, ms);
  }
}

function endMeditation() {
  clearTimeout(mtid);
  document.querySelector('.page.meditate').classList.remove('black','invert','flash','white');
  document.querySelector('.page.meditate').classList.add('hidden');
  document.exitFullscreen();
  showFooterFor(returnPage);
}

function setFlashFrequency(fq) {
  const el = document.querySelector('style#flashing');
  el && el.remove();

  const element = document.createElement('style');
  element.id = 'flashing';
  document.head.appendChild(element);
  const sheet = element.sheet;

  sheet.insertRule(`
    .page.meditate.flash {
      animation-duration:${fq}s;
    }
  `, 0);
}

function settings() {
  document.querySelector('.page.settings').classList.remove('hidden');
  showFooterFor('settings');
}

function study() {
  document.querySelector('.page.meditate').classList.remove('hidden');
  addFontId(document.querySelector('.page.meditate .hebrew-name'));
  document.querySelector('.page.study-time').classList.remove('hidden');
  showFooterFor('meditate');
  bindMeditateAbort();
}

function startStudy() {
  document.querySelector('body').requestFullscreen();
  document.querySelector('.page.study-time').classList.add('hidden');
  showFooterFor('fullscreen');
  returnPage = 'names';

  const ms = Number(document.querySelector('#study-time').value) * 1000;
  const end = Number(document.querySelector('#study-end').value) * 8;
  let id = (Number(document.querySelector('#study-start').value) - 1) * 8 + 1;

  const steps = [];
  for (let i=id; i <= end; i++) {
    if ( i % 8 === 1 && i !== id) {
      steps.push( { nameHb: '' });
    }
    steps.push( names.find( n => n.id === i) );
  }

  steps.push( { nameHb: '' });

  const repeat = Number(document.querySelector('#study-repeat').value);
  let segments = [];

  for (i = 0; i < repeat; i++) {
    segments = segments.concat(steps);
  }

  selected = segments.shift();
  setBoundFields('meditate');

  mtid = setInterval(() => {
    const segment = segments.shift();
    if (!segment) {
      endMeditation();
    } else {
      selected = segment;
      setBoundFields('meditate');
    }
  }, ms);
}

function abk(day) {
  if (day === undefined) {
    day = (new Date()).getDay();
  }

  document.querySelector('.page.abk').classList.remove('hidden');
  showFooterFor('abk');

  selected = getAnaBekoachData(day);
  setBoundFields('abk');
}

function playAbkSpeak() {
  if (selected.speechAud) {
    audio.src = selected.speechAud;
  }
}

function playAbkSong() {
  if (selected.songAud) {
    audio.src = selected.songAud;
  }
}

function chooseFont(ev) {
  document.querySelector('.page.settings').classList.add('hidden');
  showFooterFor('names');

  localStorage.font = ev.target.dataset.id;
  setFont();
}

let fontId = 'sef';

function setFont() {
  document.querySelectorAll('.font-button .hebrew-name').forEach( hn => hn.classList.remove('selected'));
  const el = document.querySelector('style#font');
  el && el.remove();

  fontId = localStorage.font;
  const fontNames = {
    std: 'StamSefarad',
    ash: 'StamAshkenaz',
    sef: 'StamSefarad',
    pal: 'Paleo',
    pro: 'Proto'
  };

  if (fontNames[fontId]) {
    try {
      const element = document.createElement('style');
      element.id = 'font';
      document.head.appendChild(element);
      const sheet = element.sheet;

      sheet.insertRule(`
        .hebrew-name {
          font-family: ${fontNames[fontId]};
        }
      `, 0);

      document.querySelector(`.font-button .hebrew-name.${fontId}`).classList.add('selected');
    } catch(e) {
      // ignore
    }
  }
}

function showFooterFor(page) {
  document.querySelector('.footer.agg').dataset.page = page;
  footerItems.forEach(item => {
    item.dataset.page.indexOf(page) !== -1
      ? item.classList.remove('hidden')
      : item.classList.add('hidden')
  });
}

// =============

initApp();
initOrientation();
calculateSizes();
initTable();
bindPageElements();
