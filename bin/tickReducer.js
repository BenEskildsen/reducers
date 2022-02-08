'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var createTickReducer = function createTickReducer(ECSFunction, config) {
  return {
    reducer: tickReducer,
    ECSFunction: ECSFunction,
    config: config
  };
};

var tickReducer = function tickReducer(game, action) {
  switch (action.type) {
    case 'START_TICK':
      {
        if (game != null && game.tickInterval != null) {
          return game;
        }

        game.prevTickTime = new Date().getTime();

        return _extends({}, game, {
          tickInterval: setInterval(
          // HACK: store is only available via window
          function () {
            return store.dispatch({ type: 'TICK' });
          }, config.msPerTick)
        });
      }
    case 'STOP_TICK':
      {
        clearInterval(game.tickInterval);
        game.tickInterval = null;

        return game;
      }
    case 'TICK':
      {
        return doTick(game, undefined.ECSFunction);
      }
  }
  return game;
};

//////////////////////////////////////////////////////////////////////////
// Do Tick
//////////////////////////////////////////////////////////////////////////
var doTick = function doTick(game, ECSFunction) {
  var curTickTime = new Date().getTime();

  game.time += 1;

  // initializations:
  if (game.time == 1) {
    game.prevTickTime = new Date().getTime();
  }

  // game/frame timing
  game.timeSinceLastTick = curTickTime - game.prevTickTime;

  // these are the ECS "systems"
  ECSFunction(game);
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

module.exports = {
  createTickReducer: createTickReducer,
  tickReducer: tickReducer
};