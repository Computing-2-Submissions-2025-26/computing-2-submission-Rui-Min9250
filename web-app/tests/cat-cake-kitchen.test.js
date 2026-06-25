import assert from "node:assert/strict";
import CatCakeKitchen from "../CatCakeKitchen.js";


const testLevel = {
  level: 1,
  name: "Test Kitchen",
  n: 4,
  cakesRequired: 1,
  ingredientsPerCake: 3,
  obstacles: 0,
  timeLimit: 30
};

const heizi = {
  name: "Heizi",
  skill: "Time Bonus",
  timeBonus: 10,
  areaCollect: false
};

const zaozao = {
  name: "Zaozao",
  skill: "Area Collect",
  timeBonus: 0,
  areaCollect: true
};

const cakes = [
  {
    name: "Strawberry Shortcake",
    image: "strawberry.png",
    ingredients: ["strawberry", "cake flour", "egg", "cream"]
  }
];

describe("Cat Cake Kitchen game module", function () {
  describe("coursework API", function () {
    it(
      "creates a game with a current order and a starting position",
      function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);

      assert.deepEqual(
        CatCakeKitchen.get_player_position(game),
        { row: 0, col: 0 }
      );
      assert.equal(
        CatCakeKitchen.get_current_order(game).name,
        "Strawberry Shortcake"
      );
      assert.equal(CatCakeKitchen.get_game_status(game), "playing");
    });

    it("moves the player one cell in a named direction", function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.move_player(game, "right");

      assert.deepEqual(
        CatCakeKitchen.get_player_position(moved),
        { row: 0, col: 1 }
      );
    });

    it("does not move the player outside the board", function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.move_player(game, "up");

      assert.deepEqual(
        CatCakeKitchen.get_player_position(moved),
        { row: 0, col: 0 }
      );
    });

    it("collects an ingredient when the player moves onto it", function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const ready = Object.assign({}, game, {
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(0, 1), "strawberry"]
        ])
      });
      const moved = CatCakeKitchen.move_player(ready, "right");

      assert.deepEqual(
        CatCakeKitchen.get_collected_ingredients(moved),
        ["strawberry"]
      );
      assert.deepEqual(
        CatCakeKitchen.get_remaining_ingredients(moved),
        ["cake flour", "egg"]
      );
    });

    it("reduces turns remaining after a successful move", function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.move_player(game, "right");

      assert.equal(moved.turnsRemaining, game.turnsRemaining - 1);
    });

    it("reports won when the current order is complete", function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const complete = Object.assign({}, game, {
        collected: new Set(["strawberry", "cake flour", "egg"])
      });

      assert.equal(CatCakeKitchen.is_order_complete(complete), true);
      assert.equal(CatCakeKitchen.get_game_status(complete), "won");
    });

    it(
      "reports lost when turns run out before the order is complete",
      function () {
      const game = CatCakeKitchen.create_game(testLevel, heizi, cakes);
      const lost = Object.assign({}, game, {
        turnsRemaining: 0
      });

      assert.equal(CatCakeKitchen.is_game_lost(lost), true);
      assert.equal(CatCakeKitchen.get_game_status(lost), "lost");
    });
  });

  describe("buildCakeQueue", function () {
    it("uses the level ingredient count to trim each cake recipe", function () {
      const queue = CatCakeKitchen.buildCakeQueue(cakes, testLevel);

      assert.equal(queue.length, 1);
      assert.deepEqual(
        queue[0].ingredients,
        ["strawberry", "cake flour", "egg"]
      );
    });
  });

  describe("moveCat", function () {
    it("moves the cat into an empty neighbouring cell", function () {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.moveCat(state, 0, 1);

      assert.deepEqual(moved.cat, { row: 0, col: 1 });
    });

    it("does not move the cat outside the board", function () {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.moveCat(state, -1, 0);

      assert.deepEqual(moved.cat, { row: 0, col: 0 });
    });

    it("does not move the cat into an obstacle", function () {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const blocked = Object.assign({}, state, {
        obstacles: new Map([[CatCakeKitchen.keyFor(0, 1), "counter"]])
      });
      const moved = CatCakeKitchen.moveCat(blocked, 0, 1);

      assert.deepEqual(moved.cat, { row: 0, col: 0 });
    });
  });

  describe("collectIngredients", function () {
    it("collects an ingredient from the cat's current cell", function () {
      const state = Object.assign(
        {},
        CatCakeKitchen.createGame(testLevel, heizi, cakes),
        {
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(0, 0), "strawberry"]
        ])
        }
      );
      const collected = CatCakeKitchen.collectIngredients(state);

      assert.equal(collected.collected.has("strawberry"), true);
      assert.equal(
        collected.ingredientsOnGrid.has(CatCakeKitchen.keyFor(0, 0)),
        false
      );
    });

    it(
      "collects nearby ingredients when the chef has area collect",
      function () {
      const state = Object.assign(
        {},
        CatCakeKitchen.createGame(testLevel, zaozao, cakes),
        {
        cat: { row: 1, col: 1 },
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(0, 0), "strawberry"],
          [CatCakeKitchen.keyFor(2, 2), "egg"]
        ])
        }
      );
      const collected = CatCakeKitchen.collectIngredients(state);

      assert.equal(collected.collected.has("strawberry"), true);
      assert.equal(collected.collected.has("egg"), true);
    });
  });

  describe("canReachAllIngredients", function () {
    it("reports reachable ingredients as reachable", function () {
      const state = Object.assign(
        {},
        CatCakeKitchen.createGame(testLevel, heizi, cakes),
        {
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(3, 3), "strawberry"]
        ])
        }
      );

      assert.equal(CatCakeKitchen.canReachAllIngredients(state), true);
    });

    it(
      "reports ingredients behind a wall of obstacles as unreachable",
      function () {
      const state = Object.assign(
        {},
        CatCakeKitchen.createGame(testLevel, heizi, cakes),
        {
        obstacles: new Map([
          [CatCakeKitchen.keyFor(1, 0), "counter"],
          [CatCakeKitchen.keyFor(1, 1), "counter"],
          [CatCakeKitchen.keyFor(1, 2), "counter"],
          [CatCakeKitchen.keyFor(1, 3), "counter"]
        ]),
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(3, 3), "strawberry"]
        ])
        }
      );

      assert.equal(CatCakeKitchen.canReachAllIngredients(state), false);
    });
  });

  describe("isCakeComplete", function () {
    it("checks whether every recipe ingredient is collected", function () {
      const cake = cakes[0];

      assert.equal(
        CatCakeKitchen.isCakeComplete(
          cake,
          new Set(["strawberry", "cake flour"])
        ),
        false
      );
      assert.equal(
        CatCakeKitchen.isCakeComplete(
          cake,
          new Set(["strawberry", "cake flour", "egg", "cream"])
        ),
        true
      );
    });
  });

  describe("calculateStars", function () {
    it("calculates stars from the fraction of time remaining", function () {
      assert.equal(
        CatCakeKitchen.calculateStars(testLevel, heizi, 25),
        "★★★"
      );
      assert.equal(
        CatCakeKitchen.calculateStars(testLevel, heizi, 12),
        "★★☆"
      );
      assert.equal(
        CatCakeKitchen.calculateStars(testLevel, heizi, 5),
        "★☆☆"
      );
      assert.equal(
        CatCakeKitchen.calculateStars(testLevel, heizi, 0),
        "☆☆☆"
      );
    });
  });
});
