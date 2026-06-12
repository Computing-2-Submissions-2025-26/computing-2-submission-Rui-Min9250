import assert from "node:assert/strict";
import CatCakeKitchen from "../Module.js";


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

describe("Cat Cake Kitchen game module", () => {
  describe("buildCakeQueue", () => {
    it("uses the level ingredient count to trim each cake recipe", () => {
      const queue = CatCakeKitchen.buildCakeQueue(cakes, testLevel);

      assert.equal(queue.length, 1);
      assert.deepEqual(
        queue[0].ingredients,
        ["strawberry", "cake flour", "egg"]
      );
    });
  });

  describe("moveCat", () => {
    it("moves the cat into an empty neighbouring cell", () => {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.moveCat(state, 0, 1);

      assert.deepEqual(moved.cat, { row: 0, col: 1 });
    });

    it("does not move the cat outside the board", () => {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const moved = CatCakeKitchen.moveCat(state, -1, 0);

      assert.deepEqual(moved.cat, { row: 0, col: 0 });
    });

    it("does not move the cat into an obstacle", () => {
      const state = CatCakeKitchen.createGame(testLevel, heizi, cakes);
      const blocked = {
        ...state,
        obstacles: new Map([[CatCakeKitchen.keyFor(0, 1), "counter"]])
      };
      const moved = CatCakeKitchen.moveCat(blocked, 0, 1);

      assert.deepEqual(moved.cat, { row: 0, col: 0 });
    });
  });

  describe("collectIngredients", () => {
    it("collects an ingredient from the cat's current cell", () => {
      const state = {
        ...CatCakeKitchen.createGame(testLevel, heizi, cakes),
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(0, 0), "strawberry"]
        ])
      };
      const collected = CatCakeKitchen.collectIngredients(state);

      assert.equal(collected.collected.has("strawberry"), true);
      assert.equal(
        collected.ingredientsOnGrid.has(CatCakeKitchen.keyFor(0, 0)),
        false
      );
    });

    it("collects nearby ingredients when the chef has area collect", () => {
      const state = {
        ...CatCakeKitchen.createGame(testLevel, zaozao, cakes),
        cat: { row: 1, col: 1 },
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(0, 0), "strawberry"],
          [CatCakeKitchen.keyFor(2, 2), "egg"]
        ])
      };
      const collected = CatCakeKitchen.collectIngredients(state);

      assert.equal(collected.collected.has("strawberry"), true);
      assert.equal(collected.collected.has("egg"), true);
    });
  });

  describe("canReachAllIngredients", () => {
    it("reports reachable ingredients as reachable", () => {
      const state = {
        ...CatCakeKitchen.createGame(testLevel, heizi, cakes),
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(3, 3), "strawberry"]
        ])
      };

      assert.equal(CatCakeKitchen.canReachAllIngredients(state), true);
    });

    it("reports ingredients behind a wall of obstacles as unreachable", () => {
      const state = {
        ...CatCakeKitchen.createGame(testLevel, heizi, cakes),
        obstacles: new Map([
          [CatCakeKitchen.keyFor(1, 0), "counter"],
          [CatCakeKitchen.keyFor(1, 1), "counter"],
          [CatCakeKitchen.keyFor(1, 2), "counter"],
          [CatCakeKitchen.keyFor(1, 3), "counter"]
        ]),
        ingredientsOnGrid: new Map([
          [CatCakeKitchen.keyFor(3, 3), "strawberry"]
        ])
      };

      assert.equal(CatCakeKitchen.canReachAllIngredients(state), false);
    });
  });

  describe("isCakeComplete", () => {
    it("checks whether every recipe ingredient is collected", () => {
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

  describe("calculateStars", () => {
    it("calculates stars from the fraction of time remaining", () => {
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
