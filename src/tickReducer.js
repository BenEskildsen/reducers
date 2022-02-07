// @flow

import type {
  Game, Entity, Action, Ant,
} from '../types';

let totalTime = 0;
const tickReducer = (game: Game, action: Action): GameState => {
  switch (action.type) {
    case 'START_TICK': {
      if (game != null && game.tickInterval != null) {
        return game;
      }

      game.prevTickTime = new Date().getTime();

      return {
        ...game,
        tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({type: 'TICK'}),
          // TODO msPerTick
          // config.msPerTick,
          16
        ),
      };
    }
    case 'STOP_TICK': {
      clearInterval(game.tickInterval);
      game.tickInterval = null;

      return game;
    }
    case 'TICK': {
      return doTick(game);
    }
  }
  return game;
};

//////////////////////////////////////////////////////////////////////////
// Do Tick
//////////////////////////////////////////////////////////////////////////
const doTick = (game: Game): Game => {
  const curTickTime = new Date().getTime();

	game.time += 1;

  // initializations:
  if (game.time == 1) {
    game.prevTickTime = new Date().getTime();
  }

  // game/frame timing
  game.timeSinceLastTick = curTickTime - game.prevTickTime;

  // these are the ECS "systems"
  // keepControlledMoving(game);
  // updateActors(game);
  // updateAgents(game);
  // updateTiledSprites(game);
  // updateViewPos(game, false /*don't clamp to world*/);
  // updateRain(game);
  // updateTicker(game);
  // updatePheromoneEmitters(game);
  // updateTowers(game);
  // updateBases(game);
  // updateBallistics(game);
  // updateFlammables(game);
  // updateCoal(game);
  // updateMeltables(game);
  // updateExplosives(game);
  // updateGenerators(game);
  // updatePheromones(game);
  // render(game);

  // update timing frames
  game.totalGameTime += curTickTime - game.prevTickTime;
  game.prevTickTime = curTickTime;

  return game;
};

module.exports = {tickReducer};
