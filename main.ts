let consoleContainer = document.getElementById('console');
const maxMessageTime = 3000;

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

    window.scrollTo(0, document.body.scrollHeight);

    let toPrint = message[0] + message.slice(1);
    let characterTypeTime = 25;
    if (characterTypeTime * toPrint.length > maxMessageTime) {
      characterTypeTime = Math.max(maxMessageTime / toPrint.length, 5);
    }
    let interval = setInterval(() => {
      if (toPrint.length === 0) {
        clearInterval(interval);
        callback();
        return;
      }
      let currentChar = toPrint[0];
      if (currentChar == '\n') {
        textContent.appendChild(document.createElement('br'));
      } else {
        textContent.innerHTML += currentChar;
      }

      toPrint = toPrint.slice(1);
    }, characterTypeTime);
  },

  getLine: (callback: Function) => {
    let lineContainer = display.getLineContainer();
    let inputSpan = lineContainer.children[0] as HTMLElement;

    inputSpan.id = 'active-input';
    inputSpan.setAttribute('contenteditable', 'true');
    inputSpan.addEventListener('input', (inputEvent) => {
      setTimeout(() => {
        let currentText = inputSpan.innerText;
        if (currentText[currentText.length - 1] === '\n') {
          inputSpan.innerText = currentText.slice(0, currentText.length - 2);
          inputSpan.setAttribute('contenteditable', "false");
          inputSpan.removeAttribute('id');
          callback(inputSpan.innerText);
        }
      }, 10);
    });
    inputSpan.addEventListener('paste', (pasteEvent) => {
      pasteEvent.preventDefault();
    });

    consoleContainer.appendChild(lineContainer);

    inputSpan.innerHTML = '';
    inputSpan['focus']();
  }
};

type StoryNode = (gameData) => void;

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

function focusOnInput() {
  let inputSpan = document.getElementById('active-input');
  if (inputSpan) {
    inputSpan['focus']();
  }
}

document.addEventListener('visibilitychange', () => {
  focusOnInput();
});

document.addEventListener('click', () => {
  focusOnInput();
});

let gameData: {
  temp: any
  player: Creature
} = {
  temp: {},
  player: undefined
};

display.print(() => {
  let storyRoot = getStoryRoot(gameData);
  storyRoot(gameData);
})('Entering world...');

function getStoryRoot(gameData): StoryNode {
  function root(gameData) {
    getPlayerName(gameData);
  }

  function getPlayerName(gameData) {
    display.print(() => {
      let counter = 0;
      let tryName = () => {
        display.getLine((name) => {
          if (name.length > 0 && name.length < 40) {
            display.print(() => {
              gameData.temp.playerName = name;
              getPlayerStats(gameData);
            })(`Welcome, ${name}.`);
          } else {
            counter++;
            let retryMessage = 'Please enter a valid name:'
            if (counter >= 3) {
              retryMessage = 'What\'s so hard about entering a name? At this rate you\'ll never be able to get started! Please, just enter a valid name:';
            }
            display.print(tryName)(retryMessage);
          }
        });
      }
      tryName();
    })(
`Welcome to Live Again. Before you get started, you will need to provide some information about yourself.
To start off, please enter your name:`
    );
  }

  function getPlayerStats(gameData) {
    let total = Math.ceil(Math.random() * 20 + 50);
    display.print(() => {
      let tryStats = () => {
        display.getLine((statsString) => {
          let stats = statsString.split(' ').map((statString) => {
            return parseInt(statString);
          });
          console.log(stats);
          if (stats.length !== 6) {
            display.print(tryStats)('Please enter exactly 6 stats:');
          } else if (statsString.indexOf('.') !== -1 || stats.reduce((acc, stat) => { return acc || isNaN(stat); }, false)) {
            display.print(tryStats)('Please enter valid numbers:');
          } else if (stats.reduce((acc, stat) => { return acc || stat <= 0 }, false)) {
            display.print(tryStats)('Please enter positive numbers:');
          } else if (stats.reduce((acc, stat) => { return acc || stat < 5 || stat > 20 }, false)) {
            display.print(tryStats)('Please ensure all of your stats are between 5 and 20.');
          } else if (stats.reduce((acc, stat) => { return acc + stat}, 0) > total) {
            display.print(tryStats)(`Please enter numbers with a total no greater than ${total}`);
          } else {
            let playerStats = new StatArray(stats[0], stats[1], stats[2], stats[3], stats[4], stats[5]);
            console.log(playerStats);
            gameData.player = new Creature(gameData.temp.playerName, 8 + statModifier(playerStats.con), 10 + statModifier(playerStats.dex), playerStats);
            display.print(start)(`Your scores have been recorded.`);
          }
        });
      };
      tryStats();
    })(
`Next, some more general information about you.
The following are some scores that quantify your various qualities, 10 being average.
  STR - Strength     - Your physical strength. Affects your ability to move things and win contests of force.
  DEX - Dexterity    - Your dexterity. Affects your ability to dodge things and balance.
  CON - Constitution - Your toughness. Affects your hitpoints and vulnerability to poison.
  INT - Intelligence - Your intelligence. Affects your ability to reason or search.
  WIS - Wisdom       - Your awareness of your environment. Affects your ability to spot things or detect deception.
  CHA - Charisma     - Your charisma. Affects your ability to interact with others.
Please enter 6 numbers (positive integers) representing the above qualities. For example,
10 15 13 7 12 14
You may enter any combination of 6 numbers with a total no greater than ${total}.
Each number should be between 5 and 20 (inclusive).
`
    );
  }

  function start(gameData) {
    display.print(() => {})('Welcome to Live Again.');
  }

  return root;
}
