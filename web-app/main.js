import CatCakeKitchenModule from "./CatCakeKitchen.js";

/**
 * Cat Cake Kitchen game module.
 * @namespace CatCakeKitchen
 */

/**
 * A position on the kitchen grid.
 * @typedef {Object} CatCakeKitchen.Position
 * @property {number} row - Row index in the grid.
 * @property {number} col - Column index in the grid.
 */

/**
 * A level configuration for one kitchen stage.
 * @typedef {Object} CatCakeKitchen.Level
 * @property {number} level - Human-readable level number.
 * @property {string} name - Level name shown in the UI.
 * @property {number} n - Grid size; the board is n by n.
 * @property {number} cakesRequired - Cake orders needed for the level.
 * @property {number} ingredientsPerCake - Ingredients used from each recipe.
 * @property {number} obstacles - Number of obstacles to place on the grid.
 * @property {number} timeLimit - Base time limit in seconds.
 */

/**
 * A playable cat chef.
 * @typedef {Object} CatCakeKitchen.Chef
 * @property {string} name - Display name.
 * @property {string} skill - Short description of the chef skill.
 * @property {string} avatar - Fallback emoji avatar.
 * @property {string} photo - Portrait image used in the UI.
 * @property {string} moveImage - Image used for the moving cat token.
 * @property {number} timeBonus - Extra seconds added to the level timer.
 * @property {boolean} areaCollect - Whether nearby ingredients are collected.
 */

/**
 * A cake recipe.
 * @typedef {Object} CatCakeKitchen.Cake
 * @property {string} name - Cake name shown to the player.
 * @property {string} image - Cake preview image.
 * @property {string[]} ingredients - Ingredients required for this cake.
 */

/**
 * A button action shown in the result modal.
 * @typedef {Object} CatCakeKitchen.ResultAction
 * @property {string} label - Button text.
 * @property {Function} onClick - Handler run when the button is clicked.
 * @property {boolean} [secondary] - Whether the secondary style is used.
 */

/**
 * Runtime state for the current play session.
 * @typedef {Object} CatCakeKitchen.GameState
 * @property {string|null} chefKey - Selected chef key.
 * @property {number} levelIndex - Current index in the levels array.
 * @property {CatCakeKitchen.Cake[]} cakeQueue - Cakes required for this level.
 * @property {number} currentCakeIndex - Current cake index in the queue.
 * @property {Set<string>} collected - Current cake ingredients collected.
 * @property {Map<string, string>} ingredientsOnGrid - Grid key to ingredient.
 * @property {Set<string>} animatedIngredients - Keys already animated.
 * @property {Map<string, string>} obstacles - Grid key to obstacle image path.
 * @property {CatCakeKitchen.Position} cat - Current cat position.
 * @property {number} timeLeft - Remaining seconds in the current level.
 * @property {number|null} timerId - Active timer id, if one exists.
 * @property {boolean} soundOn - Whether background music is enabled.
 * @property {boolean} started - Whether a game is currently active.
 */

/** @type {CatCakeKitchen.Level[]} */
const levels = [
  {
    level: 1,
    name: "Tutorial Kitchen",
    n: 8,
    cakesRequired: 1,
    ingredientsPerCake: 4,
    obstacles: 6,
    timeLimit: 30
  },
  {
    level: 2,
    name: "Bigger Kitchen",
    n: 9,
    cakesRequired: 1,
    ingredientsPerCake: 4,
    obstacles: 6,
    timeLimit: 30
  },
  {
    level: 3,
    name: "Two Cake Orders",
    n: 9,
    cakesRequired: 2,
    ingredientsPerCake: 4,
    obstacles: 6,
    timeLimit: 40
  },
  {
    level: 4,
    name: "More Ingredients",
    n: 9,
    cakesRequired: 2,
    ingredientsPerCake: 5,
    obstacles: 6,
    timeLimit: 45
  },
  {
    level: 5,
    name: "Large Kitchen",
    n: 10,
    cakesRequired: 2,
    ingredientsPerCake: 5,
    obstacles: 6,
    timeLimit: 50
  },
  {
    level: 6,
    name: "Messy Kitchen",
    n: 10,
    cakesRequired: 2,
    ingredientsPerCake: 5,
    obstacles: 9,
    timeLimit: 55
  },
  {
    level: 7,
    name: "Long Kitchen",
    n: 11,
    cakesRequired: 2,
    ingredientsPerCake: 5,
    obstacles: 9,
    timeLimit: 60
  },
  {
    level: 8,
    name: "Busy Cake Shop",
    n: 11,
    cakesRequired: 3,
    ingredientsPerCake: 5,
    obstacles: 9,
    timeLimit: 70
  },
  {
    level: 9,
    name: "Crowded Kitchen",
    n: 12,
    cakesRequired: 3,
    ingredientsPerCake: 5,
    obstacles: 12,
    timeLimit: 80
  },
  {
    level: 10,
    name: "Master Chef Challenge",
    n: 12,
    cakesRequired: 3,
    ingredientsPerCake: 5,
    obstacles: 12,
    timeLimit: 90
  }
];

/** @type {Object.<string, CatCakeKitchen.Chef>} */
const chefs = {
  heizi: {
    name: "黑子 Heizi",
    skill: "Time Bonus",
    avatar: "H",
    photo: "assets/heizi_IDphoto.png",
    moveImage: "assets/Heizi_Move.png",
    timeBonus: 10,
    areaCollect: false
  },
  zaozao: {
    name: "早早 Zaozao",
    skill: "Area Collect",
    avatar: "Z",
    photo: "assets/Zaozao_IDphoto.png",
    moveImage: "assets/Zaozao_Move.png",
    timeBonus: 0,
    areaCollect: true
  }
};

/** @type {CatCakeKitchen.Cake[]} */
const cakes = [
  {
    name: "Strawberry Shortcake",
    image: "assets/Strawberry_Shortcake_transparent.png",
    ingredients: [
      "strawberry",
      "cake flour",
      "egg",
      "whipping cream",
      "sugar"
    ]
  },
  {
    name: "Chocolate Hazelnut Cake",
    image: "assets/ChocolateHazelnutCake_transparent.png",
    ingredients: ["chocolate", "hazelnut", "cake flour", "egg", "cream"]
  },
  {
    name: "Shine Muscat Grape Tart",
    image: "assets/ShineMuscatGrapeTart_transparent.png",
    ingredients: [
      "shine muscat grape",
      "tart shell",
      "custard cream",
      "butter",
      "sugar"
    ]
  },
  {
    name: "White Peach Shortcake",
    image: "assets/WhitePeachShortcake_transparent.png",
    ingredients: [
      "white peach",
      "cake flour",
      "egg",
      "whipping cream",
      "sugar"
    ]
  },
  {
    name: "Matcha Red Bean Cake",
    image: "assets/MatchaRedBeanCake_transparent.png",
    ingredients: [
      "matcha powder",
      "red bean",
      "cake flour",
      "egg",
      "whipping cream"
    ]
  },
  {
    name: "Blueberry Yogurt Cake",
    image: "assets/BlueberryYogurtCake_transparent.png",
    ingredients: ["blueberry", "yogurt", "cake flour", "egg", "sugar"]
  },
  {
    name: "Lemon Cheesecake",
    image: "assets/LemonCheesecake_transparent.png",
    ingredients: ["lemon", "cream cheese", "biscuit base", "butter", "sugar"]
  },
  {
    name: "Chestnut Mont Blanc",
    image: "assets/ChestnutMontBlanc_transparent.png",
    ingredients: [
      "chestnut puree",
      "whipping cream",
      "sponge cake",
      "butter",
      "powdered sugar"
    ]
  },
  {
    name: "Fig Honey Mille Crepe",
    image: "assets/FigHoneyMilleCrepe_transparent.png",
    ingredients: ["fig", "honey", "crepe layer", "whipping cream", "butter"]
  },
  {
    name: "Guava Grape Mousse Cake",
    image: "assets/GuavaGrapeMousseCake_transparent.png",
    ingredients: [
      "guava",
      "shine muscat grape",
      "mousse cream",
      "gelatin",
      "sponge cake"
    ]
  },
  {
    name: "Raspberry Chocolate Cake",
    image: "assets/RaspberryChocolateCake_transparent.png",
    ingredients: ["raspberry", "chocolate", "cake flour", "egg", "cream"]
  },
  {
    name: "Caramel Nut Cake",
    image: "assets/CaramelNutCake_transparent.png",
    ingredients: ["caramel sauce", "almond", "walnut", "cake flour", "cream"]
  }
];

/** @type {Object.<string, string>} */
const ingredientIcons = {
  strawberry: "🍓",
  "cake flour": "🌾",
  egg: "🥚",
  cream: "🥛",
  "whipping cream": "🥛",
  chocolate: "🍫",
  hazelnut: "🌰",
  "shine muscat grape": "🍇",
  "tart shell": "🥧",
  "custard cream": "🍮",
  butter: "🧈",
  sugar: "🧂",
  "white peach": "🍑",
  "matcha powder": "🍵",
  "red bean": "🫘",
  blueberry: "🫐",
  yogurt: "🥣",
  lemon: "🍋",
  "cream cheese": "🧀",
  "biscuit base": "🍪",
  "chestnut puree": "🌰",
  "sponge cake": "🍰",
  "powdered sugar": "❄️",
  fig: "🟣",
  honey: "🍯",
  "crepe layer": "🥞",
  guava: "🍈",
  "mousse cream": "🍦",
  gelatin: "🧊",
  raspberry: "🍇",
  "caramel sauce": "🍮",
  almond: "🥜",
  walnut: "🌰"
};

/** @type {string[]} */
const obstacleImages = [
  "assets/obstacles_CakeDisplay.png",
  "assets/obstacles_Chair.png",
  "assets/obstacles_CoffeeStation.png",
  "assets/obstacles_counter.png",
  "assets/obstacles_Oven.png",
  "assets/obstacles_PrepTable.png",
  "assets/obstacles_Table.png"
];

const els = {
  grid: document.querySelector("#kitchenGrid"),
  rulesModal: document.querySelector("#rulesModal"),
  rulesConfirm: document.querySelector("#rulesConfirm"),
  chefModal: document.querySelector("#chefModal"),
  resultModal: document.querySelector("#resultModal"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  resultBadge: document.querySelector("#resultBadge"),
  resultActions: document.querySelector("#resultActions"),
  currentCakeName: document.querySelector("#currentCakeName"),
  cakeIcon: document.querySelector("#cakeIcon"),
  ingredientChecklist: document.querySelector("#ingredientChecklist"),
  levelText: document.querySelector("#levelText"),
  timeText: document.querySelector("#timeText"),
  cakesText: document.querySelector("#cakesText"),
  starsText: document.querySelector("#starsText"),
  chefAvatar: document.querySelector("#chefAvatar"),
  chefName: document.querySelector("#chefName"),
  chefSkill: document.querySelector("#chefSkill"),
  levelName: document.querySelector("#levelName"),
  levelHint: document.querySelector("#levelHint"),
  changeChefTop: document.querySelector("#changeChefTop"),
  soundToggle: document.querySelector("#soundToggle"),
  backgroundMusic: document.querySelector("#backgroundMusic")
};

/** @type {CatCakeKitchen.GameState} */
const state = {
  chefKey: null,
  levelIndex: 0,
  cakeQueue: [],
  currentCakeIndex: 0,
  collected: new Set(),
  ingredientsOnGrid: new Map(),
  animatedIngredients: new Set(),
  obstacles: new Map(),
  cat: { row: 0, col: 0 },
  timeLeft: 100,
  timerId: null,
  soundOn: false,
  started: false
};

document.querySelectorAll(".chef-option").forEach(function (button) {
  button.addEventListener("click", function () {
    chooseChef(button.dataset.chef);
  });
});

els.rulesConfirm.addEventListener("click", function () {
  els.rulesModal.classList.remove("is-open");
  els.chefModal.classList.add("is-open");
});

els.changeChefTop.addEventListener("click", function () {
  pauseTimer();
  els.rulesModal.classList.remove("is-open");
  els.chefModal.classList.add("is-open");
});

els.soundToggle.addEventListener("click", toggleSound);

window.addEventListener("keydown", function (event) {
  if (
    !state.started ||
    els.rulesModal.classList.contains("is-open") ||
    els.resultModal.classList.contains("is-open") ||
    els.chefModal.classList.contains("is-open")
  ) {
    return;
  }

  const moves = {
    ArrowUp: [-1, 0],
    w: [-1, 0],
    W: [-1, 0],
    ArrowDown: [1, 0],
    s: [1, 0],
    S: [1, 0],
    ArrowLeft: [0, -1],
    a: [0, -1],
    A: [0, -1],
    ArrowRight: [0, 1],
    d: [0, 1],
    D: [0, 1]
  };

  const move = moves[event.key];
  if (!move) {
    return;
  }
  event.preventDefault();
  moveCat(move[0], move[1]);
});

/**
 * Toggles the background music on or off.
 * @returns {void}
 */
function toggleSound() {
  state.soundOn = !state.soundOn;
  updateSoundButton();

  if (!state.soundOn) {
    els.backgroundMusic.pause();
    return;
  }

  els.backgroundMusic.volume = 0.45;
  els.backgroundMusic.play().catch(function () {
    state.soundOn = false;
    updateSoundButton();
  });
}

/**
 * Updates the sound button text and accessibility state.
 * @returns {void}
 */
function updateSoundButton() {
  els.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
  els.soundToggle.setAttribute(
    "aria-label",
    state.soundOn ? "Turn background music off" : "Turn background music on"
  );
  els.soundToggle.querySelector("span").textContent = (
    state.soundOn ? "🔊" : "🔇"
  );
}

/**
 * Selects a chef and starts the current level.
 * @param {string} chefKey - Key of the selected chef.
 * @returns {void}
 */
function chooseChef(chefKey) {
  state.chefKey = chefKey;
  els.chefModal.classList.remove("is-open");
  updateChefPanel();
  startLevel(state.levelIndex);
}

/**
 * Starts a level from the levels array.
 * @param {number} levelIndex - Index of the level to start.
 * @returns {void}
 */
function startLevel(levelIndex) {
  pauseTimer();
  state.levelIndex = levelIndex;
  state.currentCakeIndex = 0;
  state.started = true;
  state.cakeQueue = buildCakeQueue(levels[levelIndex]);
  state.timeLeft = (
    levels[levelIndex].timeLimit + chefs[state.chefKey].timeBonus
  );
  els.resultModal.classList.remove("is-open");
  prepareCake({ resetCat: true });
  render();
  startTimer();
}

/**
 * Builds the list of cake orders for a level.
 * @param {CatCakeKitchen.Level} level - Level configuration.
 * @returns {CatCakeKitchen.Cake[]} Cakes required for this level.
 */
function buildCakeQueue(level) {
  return CatCakeKitchenModule.buildCakeQueue(cakes, level);
}

/**
 * Prepares the board for the current cake order.
 * @param {Object} [options] - Setup options.
 * @param {boolean} [options.resetCat=false] - Whether to reset the cat.
 * @returns {void}
 */
function prepareCake({ resetCat = false } = {}) {
  const level = levels[state.levelIndex];
  state.collected = new Set();
  state.animatedIngredients = new Set();
  if (resetCat) {
    state.cat = { row: 0, col: 0 };
  }

  var attempts = 0;
  do {
    state.ingredientsOnGrid = new Map();
    state.obstacles = new Map();
    const blocked = new Set([keyFor(state.cat.row, state.cat.col)]);
    placeObstacles(level, blocked);
    placeIngredients(level, blocked);
    attempts += 1;
  } while (!canReachAllIngredients(level) && attempts < 80);

  if (!canReachAllIngredients(level)) {
    state.ingredientsOnGrid = new Map();
    state.obstacles = new Map();
    placeIngredients(level, new Set([keyFor(state.cat.row, state.cat.col)]));
  }

  collectAtCat();
}

/**
 * Randomly places obstacles on unblocked cells.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @param {Set<string>} blocked - Grid keys that cannot be used.
 * @returns {void}
 */
function placeObstacles(level, blocked) {
  var placed = 0;
  while (placed < level.obstacles) {
    const spot = randomSpot(level);
    const key = keyFor(spot.row, spot.col);
    if (blocked.has(key)) {
      continue;
    }
    blocked.add(key);
    state.obstacles.set(key, obstacleImages[placed % obstacleImages.length]);
    placed += 1;
  }
}

/**
 * Places the current cake's ingredients on unblocked cells.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @param {Set<string>} blocked - Grid keys that cannot be used.
 * @returns {void}
 */
function placeIngredients(level, blocked) {
  const currentCake = getCurrentCake();
  currentCake.ingredients.forEach(function (ingredient) {
    var spot = randomSpot(level);
    var key = keyFor(spot.row, spot.col);
    while (blocked.has(key)) {
      spot = randomSpot(level);
      key = keyFor(spot.row, spot.col);
    }
    blocked.add(key);
    state.ingredientsOnGrid.set(key, ingredient);
  });
}

/**
 * Chooses a random position inside the level grid.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @returns {CatCakeKitchen.Position} Random grid position.
 */
function randomSpot(level) {
  return {
    row: Math.floor(Math.random() * level.n),
    col: Math.floor(Math.random() * level.n)
  };
}

/**
 * Checks whether every ingredient currently on the grid can be reached.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @returns {boolean} True when all ingredient cells are reachable.
 */
function canReachAllIngredients(level) {
  const reachable = getReachableTiles(level);
  return Array.from(state.ingredientsOnGrid.keys()).every(
    function (key) {
      return reachable.has(key);
    }
  );
}

/**
 * Finds every grid cell the cat can reach without walking through obstacles.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @returns {Set<string>} Reachable grid keys.
 */
function getReachableTiles(level) {
  const startKey = keyFor(state.cat.row, state.cat.col);
  const reachable = new Set([startKey]);
  const queue = [{
    row: state.cat.row,
    col: state.cat.col
  }];

  while (queue.length > 0) {
    const spot = queue.shift();
    const neighbours = [
      { row: spot.row - 1, col: spot.col },
      { row: spot.row + 1, col: spot.col },
      { row: spot.row, col: spot.col - 1 },
      { row: spot.row, col: spot.col + 1 }
    ];
    var index;
    var next;
    var key;
    for (index = 0; index < neighbours.length; index += 1) {
      next = neighbours[index];
      key = keyFor(next.row, next.col);
      if (
        isInsideGrid(next, level) &&
        !reachable.has(key) &&
        !state.obstacles.has(key)
      ) {
        reachable.add(key);
        queue.push(next);
      }
    }
  }

  return reachable;
}

/**
 * Checks whether a position is inside the current grid.
 * @param {CatCakeKitchen.Position} spot - Position to test.
 * @param {CatCakeKitchen.Level} level - Current level configuration.
 * @returns {boolean} True when the position is inside the board.
 */
function isInsideGrid(spot, level) {
  return (
    spot.row >= 0 &&
    spot.col >= 0 &&
    spot.row < level.n &&
    spot.col < level.n
  );
}

/**
 * Moves the cat by one grid step if the target cell is valid.
 * @param {number} rowDelta - Row movement, usually -1, 0, or 1.
 * @param {number} colDelta - Column movement, usually -1, 0, or 1.
 * @returns {void}
 */
function moveCat(rowDelta, colDelta) {
  const level = levels[state.levelIndex];
  const next = { row: state.cat.row + rowDelta, col: state.cat.col + colDelta };
  if (!isInsideGrid(next, level)) {
    return;
  }
  if (state.obstacles.has(keyFor(next.row, next.col))) {
    return;
  }

  state.cat = next;
  collectAtCat();
  render();
}

/**
 * Collects ingredients at the cat's position.
 * @returns {void}
 */
function collectAtCat() {
  const chef = chefs[state.chefKey];
  const spots = [{
    row: state.cat.row,
    col: state.cat.col
  }];

  if (chef.areaCollect) {
    var row;
    var col;
    for (row = state.cat.row - 1; row <= state.cat.row + 1; row += 1) {
      for (col = state.cat.col - 1; col <= state.cat.col + 1; col += 1) {
        spots.push({ row: row, col: col });
      }
    }
  }

  spots.forEach(function (spot) {
    const key = keyFor(spot.row, spot.col);
    const ingredient = state.ingredientsOnGrid.get(key);
    if (!ingredient) {
      return;
    }
    state.collected.add(ingredient);
    state.ingredientsOnGrid.delete(key);
  });

  const cakeIsComplete = getCurrentCake().ingredients.every(
    function (ingredient) {
      return state.collected.has(ingredient);
    }
  );
  if (cakeIsComplete) {
    completeCake();
  }
}

/**
 * Advances to the next cake order, or wins the level.
 * @returns {void}
 */
function completeCake() {
  state.currentCakeIndex += 1;
  if (state.currentCakeIndex >= state.cakeQueue.length) {
    winLevel();
    return;
  }

  setTimeout(function () {
    prepareCake();
    render();
  }, 250);
}

/**
 * Handles successful completion of the current level.
 * @returns {void}
 */
function winLevel() {
  pauseTimer();
  const finalLevel = state.levelIndex === levels.length - 1;
  const stars = calculateStars();
  render();

  if (finalLevel) {
    showResult({
      badge: "🏆",
      title: "Congratulations!",
      message: `You are the Master Cat Chef! Final rating: ${stars}`,
      actions: [
        {
          label: "Play Again",
          onClick: function () {
            startLevel(0);
          }
        },
        { label: "Change Chef", secondary: true, onClick: openChefAndReset }
      ]
    });
    return;
  }

  showResult({
    badge: "🍰",
    title: "Success! Level Up!",
    message: (
      `Level ${levels[state.levelIndex].level} complete. Rating: ${stars}`
    ),
    actions: [
      {
        label: "Next Level",
        onClick: function () {
          startLevel(state.levelIndex + 1);
        }
      },
      { label: "Change Chef", secondary: true, onClick: openChefForNextLevel }
    ]
  });
}

/**
 * Handles running out of time on the current level.
 * @returns {void}
 */
function failLevel() {
  pauseTimer();
  showResult({
    badge: "⏰",
    title: "Fail!",
    message: "The cake order ran out of time.",
    actions: [
      {
        label: "Retry Level",
        onClick: function () {
          startLevel(state.levelIndex);
        }
      },
      { label: "Change Chef", secondary: true, onClick: openChefForRetry },
      { label: "Back to Start", secondary: true, onClick: openChefAndReset }
    ]
  });
}

/**
 * Opens the result modal with a message and action buttons.
 * @param {Object} result - Result modal content.
 * @param {string} result.badge - Emoji or short badge shown at the top.
 * @param {string} result.title - Modal title.
 * @param {string} result.message - Modal body message.
 * @param {CatCakeKitchen.ResultAction[]} result.actions - Modal buttons.
 * @returns {void}
 */
function showResult({ badge, title, message, actions }) {
  els.resultBadge.textContent = badge;
  els.resultTitle.textContent = title;
  els.resultMessage.textContent = message;
  els.resultActions.innerHTML = "";
  actions.forEach(function (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    if (action.secondary) {
      button.classList.add("secondary");
    }
    button.addEventListener("click", function () {
      els.resultModal.classList.remove("is-open");
      action.onClick();
    });
    els.resultActions.append(button);
  });
  els.resultModal.classList.add("is-open");
}

/**
 * Opens the chef selector before starting the next level.
 * @returns {void}
 */
function openChefForNextLevel() {
  state.levelIndex += 1;
  els.chefModal.classList.add("is-open");
}

/**
 * Opens the chef selector before retrying the current level.
 * @returns {void}
 */
function openChefForRetry() {
  els.chefModal.classList.add("is-open");
}

/**
 * Resets the game to the first level and opens the chef selector.
 * @returns {void}
 */
function openChefAndReset() {
  state.levelIndex = 0;
  state.started = false;
  render();
  els.chefModal.classList.add("is-open");
}

/**
 * Starts the countdown timer for the current level.
 * @returns {void}
 */
function startTimer() {
  updateTime();
  state.timerId = window.setInterval(function () {
    state.timeLeft -= 1;
    updateTime();
    if (state.timeLeft <= 0) {
      failLevel();
    }
  }, 1000);
}

/**
 * Stops the countdown timer if it is running.
 * @returns {void}
 */
function pauseTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

/**
 * Renders the board, HUD, cake panel, chef panel, and timer.
 * @returns {void}
 */
function render() {
  const level = levels[state.levelIndex];
  const currentCake = getCurrentCake();
  els.grid.style.setProperty("--rows", level.n);
  els.grid.style.setProperty("--cols", level.n);
  els.grid.style.gridTemplateColumns = `repeat(${level.n}, minmax(0, 1fr))`;
  els.grid.style.gridTemplateRows = `repeat(${level.n}, minmax(0, 1fr))`;
  els.grid.innerHTML = "";

  var row;
  var col;
  for (row = 0; row < level.n; row += 1) {
    for (col = 0; col < level.n; col += 1) {
      const tile = document.createElement("div");
      const key = keyFor(row, col);
      tile.className = "tile";
      tile.classList.add((row + col) % 2 === 0 ? "tile-a" : "tile-b");

      if (state.obstacles.has(key)) {
        tile.classList.add("obstacle");
        const image = document.createElement("img");
        image.className = "obstacle-image";
        image.src = state.obstacles.get(key);
        image.alt = "";
        tile.append(image);
      }

      if (state.ingredientsOnGrid.has(key)) {
        const ingredient = state.ingredientsOnGrid.get(key);
        tile.classList.add("ingredient");
        if (!state.animatedIngredients.has(key)) {
          tile.classList.add("ingredient-new");
          state.animatedIngredients.add(key);
        }
        tile.textContent = ingredientIcons[ingredient] || "🥣";
      }

      if (state.cat.row === row && state.cat.col === col && state.chefKey) {
        const cat = document.createElement("span");
        const catImage = document.createElement("img");
        cat.className = `cat-token ${state.chefKey}`;
        catImage.src = chefs[state.chefKey].moveImage;
        catImage.alt = `${chefs[state.chefKey].name} cat chef`;
        tile.textContent = "";
        cat.append(catImage);
        tile.append(cat);
      }

      els.grid.append(tile);
    }
  }

  els.levelText.textContent = level.level;
  const cakesFinished = Math.min(
    state.currentCakeIndex,
    state.cakeQueue.length
  );
  els.cakesText.textContent = `${cakesFinished} / ${level.cakesRequired}`;
  els.levelName.textContent = level.name;
  els.levelHint.textContent = level.level === 1
    ? "Use WASD or arrow keys to move your cat chef."
    : `${level.n} × ${level.n} grid, ${level.obstacles} obstacles.`;
  els.currentCakeName.textContent = currentCake
    ? `${currentCake.name}${isCakeDone(currentCake) ? " ✓" : ""}`
    : "Choose a chef";
  renderCakeIcon(currentCake);
  renderChecklist(currentCake);
  updateChefPanel();
  updateTime();
}

/**
 * Renders the image for the current cake order.
 * @param {CatCakeKitchen.Cake} currentCake - Cake currently being made.
 * @returns {void}
 */
function renderCakeIcon(currentCake) {
  els.cakeIcon.innerHTML = "";
  if (!currentCake) {
    return;
  }
  const image = document.createElement("img");
  image.src = currentCake.image;
  image.alt = currentCake.name;
  els.cakeIcon.append(image);
}

/**
 * Renders the ingredient checklist for the current cake.
 * @param {CatCakeKitchen.Cake} currentCake - Cake currently being made.
 * @returns {void}
 */
function renderChecklist(currentCake) {
  els.ingredientChecklist.innerHTML = "";
  if (!currentCake) {
    return;
  }
  currentCake.ingredients.forEach(function (ingredient) {
    const item = document.createElement("li");
    if (state.collected.has(ingredient)) {
      item.classList.add("done");
    }
    const icon = ingredientIcons[ingredient] || "🥣";
    const marker = state.collected.has(ingredient) ? "✓" : "☐";
    item.innerHTML = [
      `<span aria-hidden="true">${icon}</span>`,
      `<span>${titleCase(ingredient)}</span>`,
      `<span>${marker}</span>`
    ].join("");
    els.ingredientChecklist.append(item);
  });
}

/**
 * Updates the selected chef card in the side panel.
 * @returns {void}
 */
function updateChefPanel() {
  const chef = chefs[state.chefKey] || chefs.heizi;
  els.chefAvatar.innerHTML = "";
  if (chef.photo) {
    const image = document.createElement("img");
    image.src = chef.photo;
    image.alt = `${chef.name} chef portrait`;
    els.chefAvatar.append(image);
  } else {
    els.chefAvatar.textContent = chef.avatar;
  }
  els.chefName.textContent = chef.name;
  els.chefSkill.textContent = chef.skill;
}

/**
 * Updates the timer text and star rating display.
 * @returns {void}
 */
function updateTime() {
  els.timeText.textContent = `${Math.max(0, state.timeLeft)}s`;
  els.timeText.classList.toggle(
    "time-low",
    state.timeLeft <= 10 && state.started
  );
  els.starsText.textContent = calculateStars();
}

/**
 * Calculates the current star rating based on remaining time.
 * @returns {string} Star rating shown in the UI.
 */
function calculateStars() {
  const level = levels[state.levelIndex];
  const chef = chefs[state.chefKey] || chefs.heizi;
  return CatCakeKitchenModule.calculateStars(level, chef, state.timeLeft);
}

/**
 * Gets the current cake order, with a safe fallback.
 * @returns {CatCakeKitchen.Cake} Current cake.
 */
function getCurrentCake() {
  return (
    state.cakeQueue[state.currentCakeIndex] ||
    state.cakeQueue[state.cakeQueue.length - 1] ||
    cakes[0]
  );
}

/**
 * Checks whether all ingredients for a cake have been collected.
 * @param {CatCakeKitchen.Cake} cake - Cake to check.
 * @returns {boolean} True when the cake is complete.
 */
function isCakeDone(cake) {
  return cake.ingredients.every(
    function (ingredient) {
      return state.collected.has(ingredient);
    }
  );
}

/**
 * Converts a grid position into a map key.
 * @param {number} row - Row index.
 * @param {number} col - Column index.
 * @returns {string} Map key for the position.
 */
function keyFor(row, col) {
  return CatCakeKitchenModule.keyFor(row, col);
}

/**
 * Converts lower-case ingredient names into title case for display.
 * @param {string} text - Text to convert.
 * @returns {string} Title-cased text.
 */
function titleCase(text) {
  return text
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

render();
