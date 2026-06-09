/**
 * Cat Cake Kitchen is a module to model the state and rules of a
 * turn-based kitchen grid collection game.
 * @namespace CatCakeKitchen
 * @author Rui Min
 */
const CatCakeKitchen = Object.create(null);

/**
 * A position on the kitchen grid.
 * @memberof CatCakeKitchen
 * @typedef {Object} Position
 * @property {number} row Row index in the grid.
 * @property {number} col Column index in the grid.
 */

/**
 * A level configuration for one kitchen stage.
 * @memberof CatCakeKitchen
 * @typedef {Object} Level
 * @property {number} level Human-readable level number.
 * @property {string} name Level name shown in the UI.
 * @property {number} n Grid size; the board is n by n.
 * @property {number} cakesRequired Number of cakes needed to complete the level.
 * @property {number} ingredientsPerCake Number of ingredients used from each cake recipe.
 * @property {number} obstacles Number of obstacles to place on the grid.
 * @property {number} timeLimit Base time limit in seconds.
 */

/**
 * A cake recipe.
 * @memberof CatCakeKitchen
 * @typedef {Object} Cake
 * @property {string} name Cake name shown to the player.
 * @property {string} image Cake preview image.
 * @property {string[]} ingredients Ingredients required for this cake.
 */

/**
 * A playable cat chef.
 * @memberof CatCakeKitchen
 * @typedef {Object} Chef
 * @property {string} name Display name.
 * @property {string} skill Short description of the chef skill.
 * @property {number} timeBonus Extra seconds added to the level timer.
 * @property {boolean} areaCollect Whether the chef collects surrounding ingredients.
 */

/**
 * A complete game state that can be simulated without the web interface.
 * @memberof CatCakeKitchen
 * @typedef {Object} GameState
 * @property {CatCakeKitchen.Level} level Current level configuration.
 * @property {CatCakeKitchen.Chef} chef Current chef.
 * @property {CatCakeKitchen.Cake[]} cakeQueue Cake orders for this level.
 * @property {number} currentCakeIndex Current cake index in the queue.
 * @property {Set<string>} collected Ingredients collected for the current cake.
 * @property {Map<string, string>} ingredientsOnGrid Grid key to ingredient name.
 * @property {Map<string, string>} obstacles Grid key to obstacle image or id.
 * @property {CatCakeKitchen.Position} cat Current cat position.
 * @property {number} timeLeft Remaining seconds.
 */

/**
 * Converts a row and column into a stable key for Maps and Sets.
 * @memberof CatCakeKitchen
 * @function
 * @param {number} row Row index.
 * @param {number} col Column index.
 * @returns {string} A key representing the grid position.
 */
CatCakeKitchen.keyFor = function (row, col) {
    return `${row},${col}`;
};

/**
 * Checks whether a position is inside a level's square grid.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.Position} position Position to check.
 * @param {CatCakeKitchen.Level} level Current level.
 * @returns {boolean} True when the position is inside the board.
 */
CatCakeKitchen.isInsideGrid = function (position, level) {
    return (
        position.row >= 0 &&
        position.col >= 0 &&
        position.row < level.n &&
        position.col < level.n
    );
};

/**
 * Builds the queue of cake orders for a level.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.Cake[]} cakes Available cake recipes.
 * @param {CatCakeKitchen.Level} level Current level.
 * @returns {CatCakeKitchen.Cake[]} Cake orders for the level.
 */
CatCakeKitchen.buildCakeQueue = function (cakes, level) {
    return Array.from({length: level.cakesRequired}, function (_, index) {
        const base = cakes[(level.level + index - 1) % cakes.length];
        return {
            ...base,
            ingredients: base.ingredients.slice(0, level.ingredientsPerCake)
        };
    });
};

/**
 * Creates an initial state for a level.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.Level} level Level to initialise.
 * @param {CatCakeKitchen.Chef} chef Selected chef.
 * @param {CatCakeKitchen.Cake[]} cakes Available cake recipes.
 * @returns {CatCakeKitchen.GameState} Initial game state.
 */
CatCakeKitchen.createGame = function (level, chef, cakes) {
    return {
        level,
        chef,
        cakeQueue: CatCakeKitchen.buildCakeQueue(cakes, level),
        currentCakeIndex: 0,
        collected: new Set(),
        ingredientsOnGrid: new Map(),
        obstacles: new Map(),
        cat: {row: 0, col: 0},
        timeLeft: level.timeLimit + chef.timeBonus
    };
};

/**
 * Returns every grid key the cat can reach without crossing obstacles.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.GameState} state Current game state.
 * @returns {Set<string>} Reachable grid keys.
 */
CatCakeKitchen.getReachableTiles = function (state) {
    const startKey = CatCakeKitchen.keyFor(state.cat.row, state.cat.col);
    const reachable = new Set([startKey]);
    const queue = [{...state.cat}];

    while (queue.length > 0) {
        const position = queue.shift();
        [
            {row: position.row - 1, col: position.col},
            {row: position.row + 1, col: position.col},
            {row: position.row, col: position.col - 1},
            {row: position.row, col: position.col + 1}
        ].forEach(function (next) {
            const key = CatCakeKitchen.keyFor(next.row, next.col);
            if (!CatCakeKitchen.isInsideGrid(next, state.level)) {
                return;
            }
            if (reachable.has(key) || state.obstacles.has(key)) {
                return;
            }
            reachable.add(key);
            queue.push(next);
        });
    }

    return reachable;
};

/**
 * Checks whether all placed ingredients are reachable by the cat.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.GameState} state Current game state.
 * @returns {boolean} True when all ingredient cells are reachable.
 */
CatCakeKitchen.canReachAllIngredients = function (state) {
    const reachable = CatCakeKitchen.getReachableTiles(state);
    return Array.from(state.ingredientsOnGrid.keys()).every(
        (key) => reachable.has(key)
    );
};

/**
 * Moves the cat by one step if the target cell is inside the grid and not
 * blocked. This function is pure: it returns a new state and does not mutate
 * the old one.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.GameState} state Current game state.
 * @param {number} rowDelta Row movement, usually -1, 0, or 1.
 * @param {number} colDelta Column movement, usually -1, 0, or 1.
 * @returns {CatCakeKitchen.GameState} Updated state after the attempted move.
 */
CatCakeKitchen.moveCat = function (state, rowDelta, colDelta) {
    const next = {
        row: state.cat.row + rowDelta,
        col: state.cat.col + colDelta
    };
    if (!CatCakeKitchen.isInsideGrid(next, state.level)) {
        return state;
    }
    if (state.obstacles.has(CatCakeKitchen.keyFor(next.row, next.col))) {
        return state;
    }
    return {
        ...state,
        cat: next
    };
};

/**
 * Collects ingredients from the cat's cell, and optionally the surrounding
 * cells. This function is pure: it returns a new state and does not mutate the
 * old one.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.GameState} state Current game state.
 * @returns {CatCakeKitchen.GameState} Updated state after collecting ingredients.
 */
CatCakeKitchen.collectIngredients = function (state) {
    const collected = new Set(state.collected);
    const ingredientsOnGrid = new Map(state.ingredientsOnGrid);
    const spots = [{...state.cat}];

    if (state.chef.areaCollect) {
        for (let row = state.cat.row - 1; row <= state.cat.row + 1; row += 1) {
            for (
                let col = state.cat.col - 1;
                col <= state.cat.col + 1;
                col += 1
            ) {
                spots.push({row, col});
            }
        }
    }

    spots.forEach(function (spot) {
        const key = CatCakeKitchen.keyFor(spot.row, spot.col);
        const ingredient = ingredientsOnGrid.get(key);
        if (!ingredient) {
            return;
        }
        collected.add(ingredient);
        ingredientsOnGrid.delete(key);
    });

    return {
        ...state,
        collected,
        ingredientsOnGrid
    };
};

/**
 * Checks whether all ingredients for a cake have been collected.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.Cake} cake Cake order to check.
 * @param {Set<string>} collected Collected ingredient names.
 * @returns {boolean} True when the cake is complete.
 */
CatCakeKitchen.isCakeComplete = function (cake, collected) {
    return cake.ingredients.every((ingredient) => collected.has(ingredient));
};

/**
 * Calculates the star rating from remaining time.
 * @memberof CatCakeKitchen
 * @function
 * @param {CatCakeKitchen.Level} level Current level.
 * @param {CatCakeKitchen.Chef} chef Current chef.
 * @param {number} timeLeft Remaining seconds.
 * @returns {string} Star rating.
 */
CatCakeKitchen.calculateStars = function (level, chef, timeLeft) {
    const totalTime = level.timeLimit + chef.timeBonus;
    const remainingRatio = timeLeft / totalTime;
    if (remainingRatio >= 0.5) {
        return "★★★";
    }
    if (remainingRatio >= 0.25) {
        return "★★☆";
    }
    if (timeLeft > 0) {
        return "★☆☆";
    }
    return "☆☆☆";
};

export default Object.freeze(CatCakeKitchen);
