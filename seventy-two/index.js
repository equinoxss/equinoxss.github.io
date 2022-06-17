let selected = null;
let ibound = false;
let bbound = false;
let sbound = false;
let names = [];
let orientation = 'portrait';

function initApp() {
  document.querySelector('#settings').addEventListener('click', () => settings());
  setFont();
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
    <div class="name-cell hebrew-name small" data-id="${cell.id}">${cell.nameHb}</div>
  `);

  el.innerHTML = cells.join('');

  el.addEventListener('click', event => {
    document.querySelector('.page.info').classList.remove('hidden');
    document.querySelector('.footer.info').classList.remove('hidden');
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

  sheet.insertRule(`
    .column {
      width: ${w}px;
      height: ${h}px;
    }
  `);

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
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('click', chooseFont));
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('mousedown', ev => ev.target.classList.add('pressed')));
  document.querySelectorAll('.font-wrap .font-button').forEach(btn => btn.addEventListener('mouseup', ev => ev.target.classList.remove('pressed')));
}

function bindElements() {
  ibound = true;
  document.querySelector('.footer #previous').addEventListener('click', () => previous());
  document.querySelector('.footer #home').addEventListener('click', () => home());
  document.querySelector('.footer #meditate').addEventListener('click', () => meditate());
  document.querySelector('.footer #next').addEventListener('click', () => next());
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
    field.innerText = selected[field.dataset.bind];
  });
}

function home() {
  document.querySelector('.page.info').classList.add('hidden');
  document.querySelector('.footer.info').classList.add('hidden');
}

function previous() {
  showInfo( Math.max(selected.id - 1, 1) );
}

function next() {
  showInfo( Math.min(selected.id + 1, 72) );
}

function back(from) {
  document.querySelector('.footer.back').classList.add('hidden');

  if (from === 'meditate') {
    document.querySelector('.page.meditate').classList.add('hidden');
    document.querySelector('.page.meditate-time').classList.add('hidden');
  } else if (from === 'settings') {
    document.querySelector('.page.settings').classList.add('hidden');
  }
}

function meditate() {
  document.querySelector('.page.meditate').classList.remove('hidden');
  addFontId(document.querySelector('.page.meditate .hebrew-name'));
  document.querySelector('.page.meditate-time').classList.remove('hidden');
  document.querySelector('.footer.back').classList.remove('hidden');
  
  if (!bbound) {
    bbound = true;
    document.querySelector('.footer #back').addEventListener('click', () => back('meditate'));

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

function startMeditation() {
  document.querySelector('body').requestFullscreen();
  document.querySelector('.page.meditate-time').classList.add('hidden');
  document.querySelector('.footer.back').classList.add('hidden');
  setBoundFields('meditate');

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
          document.querySelector('.page.meditate').classList.add('black');
      
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
  document.querySelector('.page.meditate').classList.remove('black','invert','flash');
  // document.querySelector('.page.meditate').classList.remove('invert');
  document.querySelector('.page.meditate').classList.add('hidden');
  document.exitFullscreen();
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
  document.querySelector('.footer.back').classList.remove('hidden');

  if (!sbound) {
    sbound = true;
    document.querySelector('.footer #back').addEventListener('click', () => back('settings'));
  }  
}

function chooseFont(ev) {
  document.querySelector('.page.settings').classList.add('hidden');
  document.querySelector('.footer.back').classList.add('hidden');

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
    std: 'initial',
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

// =============

initApp();
initOrientation();
calculateSizes();
initTable();
bindPageElements();
