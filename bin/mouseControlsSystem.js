'use strict';

var canvasToGrid = require('bens_utils').gridHelpers.canvasToGrid;

var throttle = require('bens_utils').helpers.throttle;

var initMouseControlsSystem = function initMouseControlsSystem(store, handlers, canvasSize) {
  var dispatch = store.dispatch;
  // const {
  //   leftDown, leftUp, rightDown, rightUp, mouseMove, scroll
  // } = handlers;

  if (handlers.mouseMove) {
    document.onmousemove = throttle(moveHandler, [store, handlers], 12);
    document.ontouchmove = function (ev) {
      if (ev.target.id === 'canvas') {
        ev.preventDefault();
      }
      moveHandler(store, handlers, ev);
    };
  } else {
    document.onmousemove = null;
    document.ontouchmove = null;
  }

  document.ontouchstart = function (ev) {
    onMouseDown(store, ev, handlers, canvasSize);
  };

  document.ontouchend = function (ev) {
    onMouseUp(store, ev, handlers, canvasSize);
  };

  document.ontouchcancel = function (ev) {
    onMouseUp(store, ev, handlers, canvasSize);
  };

  // if (handlers.leftDown || handlers.rightDown) {
  document.onmousedown = function (ev) {
    onMouseDown(store, ev, handlers, canvasSize);
  };
  // }

  // if (handlers.leftUp || handlers.rightUp) {
  document.onmouseup = function (ev) {
    onMouseUp(store, ev, handlers, canvasSize);
  };
  // }

  if (handlers.scroll) {
    var scrollLocked = false;
    document.onwheel = function (ev) {
      if (!scrollLocked) {
        onScroll(store, ev, handlers, canvasSize);
        scrollLocked = true;
        setTimeout(function () {
          scrollLocked = false;
        }, 150);
      }
    };
  }
};

/////////////////////////////////////////////////////////////////////
// Scroll
////////////////////////////////////////////////////////////////////
var onScroll = function onScroll(store, ev, handlers, canvasSize) {
  var mouseData = validateMouse(store, ev, canvsSize);
  if (mouseData == null) return;
  handlers.scroll(store.getState(), store.dispatch, ev.wheelDelta < 0 ? 1 : -1);
};

/////////////////////////////////////////////////////////////////////
// Click
////////////////////////////////////////////////////////////////////

var onMouseDown = function onMouseDown(store, ev, handlers, canvasSize) {
  var canvas = document.getElementById('canvas');
  // don't open the normal right-click menu
  if (canvas != null) {
    canvas.addEventListener('contextmenu', function (ev) {
      return ev.preventDefault();
    });
  }
  var topBar = document.getElementById('topBar');
  if (topBar != null) {
    topBar.addEventListener('contextmenu', function (ev) {
      return ev.preventDefault();
    });
  }

  var mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  var gridPos = mouseData.gridPos,
      state = mouseData.state,
      game = mouseData.game;
  var dispatch = store.dispatch;


  if (ev.button == 0) {
    // left click
    var _game = state.game;

    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: true, isDown: true, downPos: gridPos
    });
    if (handlers.leftDown != null) {
      handlers.leftDown(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) {
    // right click
    var _game2 = state.game;

    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: false, isDown: true, downPos: gridPos
    });
    if (handlers.rightDown != null) {
      handlers.rightDown(state, dispatch, gridPos);
    }
  }
};

var onMouseUp = function onMouseUp(store, ev, handlers, canvasSize) {
  var mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  var gridPos = mouseData.gridPos,
      state = mouseData.state,
      game = mouseData.game;
  var dispatch = store.dispatch;


  if (ev.button == 0) {
    // left click
    dispatch({ type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false });
    if (handlers.leftUp != null) {
      handlers.leftUp(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) {
    // right click
    dispatch({ type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false });
    if (handlers.rightUp != null) {
      handlers.rightUp(state, dispatch, gridPos);
    }
  }
};

////////////////////////////////////////////////////////////////////////////
// Mouse move
////////////////////////////////////////////////////////////////////////////
var moveHandler = function moveHandler(store, handlers, ev, canvasSize) {
  var canvas = document.getElementById('canvas');
  var dispatch = store.dispatch;

  var mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  var gridPos = mouseData.gridPos,
      state = mouseData.state,
      game = mouseData.game;


  var canvasPos = getMousePixel(ev, canvas);
  dispatch({ type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos });
  if (handlers.mouseMove != null) {
    handlers.mouseMove(state, dispatch, gridPos, canvasPos);
  }
};

////////////////////////////////////////////////////////////////////////////
// click -> position helpers
////////////////////////////////////////////////////////////////////////////

var validateMouse = function validateMouse(store, ev, canvasSize) {
  if (ev.target.id != 'canvas') return null;
  var state = store.getState();
  if (state.game == null) return null;
  var gridPos = getMouseCell(state.game, ev, canvas);
  if (gridPos == null) return null;
  var game = state.game;


  return { state: state, game: game, gridPos: gridPos };
};

var getMouseCell = function getMouseCell(game, ev, canvas, canvasSize) {
  var pixel = getMousePixel(ev, canvas, canvasSize);
  if (pixel == null) return null;
  return canvasToGrid(game, pixel, canvasSize);
};

var getMousePixel = function getMousePixel(ev, canvas, canvasSize) {
  var canvasWidth = canvasSize.width,
      canvasHeight = canvasSize.height;

  if (!canvas) {
    return null;
  }
  var rect = canvas.getBoundingClientRect();
  var x = ev.clientX;
  var y = ev.clientY;
  if (ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend') {
    var touch = ev.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  }
  var canvasPos = {
    x: x - rect.left,
    y: y - rect.top
  };
  // return null if clicked outside the canvas:
  if (canvasPos.x < 0 || canvasPos.y < 0 || canvasPos.x > canvasWidth || canvasPos.y > canvasHeight) {
    return null;
  }
  return canvasPos;
};

module.exports = { initMouseControlsSystem: initMouseControlsSystem };