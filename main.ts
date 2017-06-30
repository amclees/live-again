let consoleContainer = document.getElementById('console');
const characterTypeTime = 40;

let display = {
  getLineContainer: () => {
    let paragraph = document.createElement('p');
    let contentZone = document.createElement('span');
    paragraph.innerText = 'live-again> ';
    paragraph.appendChild(contentZone);
    return paragraph;
  },

  print: (callback: Function) => (message: string) => {
    let lineContainer = display.getLineContainer();
    let textContent = lineContainer.children[0];
    consoleContainer.appendChild(lineContainer);

    let toPrint = message[0] + message.slice(1);
    let interval = setInterval(() => {
      if (toPrint.length === 0) {
        clearInterval(interval);
        callback();
        return;
      }
      textContent.innerHTML += toPrint[0];
      toPrint = toPrint.slice(1);
    }, characterTypeTime);
  },

  getLine: (callback: Function) => {
    let lineContainer = display.getLineContainer();
    let inputSpan = lineContainer.children[0] as HTMLElement;

    inputSpan.setAttribute('contenteditable', "true");
    inputSpan.addEventListener('input', (inputEvent) => {
      setTimeout(() => {
        let currentText = inputSpan.innerText;
        if (currentText[currentText.length - 1] === '\n') {
          inputSpan.innerText = currentText.slice(0, currentText.length - 1);
          inputSpan.setAttribute('contenteditable', "false");
          callback(inputSpan.innerText);
        }
      }, 10);
    });

    consoleContainer.appendChild(lineContainer);

    inputSpan.innerHTML = '';
    inputSpan['focus']();
  }
};

class StatArray {
  constructor(
    public str: number,
    public dex: number,
    public con: number,
    public int: number,
    public wis: number,
    public cha: number
  ) { }
}

function statModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

class Creature {
  constructor(
    public name: string,
    public hp: number,
    public ac: number,
    public stats: StatArray
  ) { }
}

let Dice = {
  dx: (sides: number) => (amount: number) => () => {
    return amount + Math.round((Math.random() * (sides - 1) * amount))
  },
  d20: () => { 0 }
};
Dice.d20 = Dice.dx(20)(1);

display.print(() => {
  display.getLine((input) => {
    display.print(() => {})(`You entered ${input}`);
  });
})('Entering world...');
