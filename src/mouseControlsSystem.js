// @flow

const {canvasToGrid} = require('bens_utils').gridHelpers;
const {throttle} = require('bens_utils').helpers;

const initMouseControlsSystem = (store, handlers, canvasSize) => {
  const {dispatch} = store;
  // const {
  //   leftDown, leftUp, rightDown, rightUp, mouseMove, scroll
  // } = handlers;

  if (handlers.mouseMove) {
    document.onmousemove = throttle(moveHandler, [store, handlers], 12);
    document.ontouchmove = (ev) => {
      if (ev.target.id === 'canvas') {
        ev.preventDefault();
      }
      moveHandler(store, handlers, ev);
    }
  } else {
    document.onmousemove = null;
    document.ontouchmove = null;
  }


  document.ontouchstart = (ev) => {
    onMouseDown(store, ev, handlers, canvasSize);
  }

  document.ontouchend = (ev) => {
    onMouseUp(store, ev, handlers, canvasSize);
  }

  document.ontouchcancel = (ev) => {
    onMouseUp(store, ev, handlers, canvasSize);
  }

  // if (handlers.leftDown || handlers.rightDown) {
    document.onmousedown = (ev) => {
      onMouseDown(store, ev, handlers, canvasSize);
    }
  // }

  // if (handlers.leftUp || handlers.rightUp) {
    document.onmouseup = (ev) => {
      onMouseUp(store, ev, handlers, canvasSize);
    }
  // }

  if (handlers.scroll) {
    let scrollLocked = false;
    document.onwheel = (ev) => {
      if (!scrollLocked) {
        onScroll(store, ev, handlers, canvasSize);
        scrollLocked = true;
        setTimeout(() => {scrollLocked = false}, 150);
      }
    }
  }

};

/////////////////////////////////////////////////////////////////////
// Scroll
////////////////////////////////////////////////////////////////////
const onScroll = (store, ev, handlers, canvasSize): void => {
  const mouseData = validateMouse(store, ev, canvsSize);
  if (mouseData == null) return;
  handlers.scroll(
    store.getState(),
    store.dispatch,
    ev.wheelDelta < 0 ? 1 : -1,
  );
};

/////////////////////////////////////////////////////////////////////
// Click
////////////////////////////////////////////////////////////////////

const onMouseDown = (store, ev, handlers, canvasSize): void => {
  let canvas = document.getElementById('canvas');
  // don't open the normal right-click menu
  if (canvas != null) {
    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }
  let topBar = document.getElementById('topBar');
  if (topBar != null) {
    topBar.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  const mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  const {gridPos, state, game} = mouseData;
  const {dispatch} = store;

  if (ev.button == 0) { // left click
    const {game} = state;
    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: true, isDown: true, downPos: gridPos,
    });
    if (handlers.leftDown != null) {
      handlers.leftDown(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) { // right click
    const {game} = state;
    dispatch({
      type: 'SET_MOUSE_DOWN',
      isLeft: false, isDown: true, downPos: gridPos,
    });
    if (handlers.rightDown != null) {
      handlers.rightDown(state, dispatch, gridPos);
    }
  }
};

const onMouseUp = (store, ev, handlers, canvasSize): void => {
  const mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  const {gridPos, state, game} = mouseData;
  const {dispatch} = store;

  if (ev.button == 0) { // left click
    dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false});
    if (handlers.leftUp != null) {
      handlers.leftUp(state, dispatch, gridPos);
    }
  }
  if (ev.button == 2) { // right click
    dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false});
    if (handlers.rightUp != null) {
      handlers.rightUp(state, dispatch, gridPos);
    }
  }
};

////////////////////////////////////////////////////////////////////////////
// Mouse move
////////////////////////////////////////////////////////////////////////////
const moveHandler = (store, handlers, ev, canvasSize): void => {
  let canvas = document.getElementById('canvas');
  const {dispatch} = store;
  const mouseData = validateMouse(store, ev, canvasSize);
  if (mouseData == null) return;
  const {gridPos, state, game} = mouseData;

  const canvasPos = getMousePixel(ev, canvas);
  dispatch({type: 'SET_MOUSE_POS', curPos: gridPos, curPixel: canvasPos});
  if (handlers.mouseMove != null) {
    handlers.mouseMove(state, dispatch, gridPos, canvasPos);
  }
}

////////////////////////////////////////////////////////////////////////////
// click -> position helpers
////////////////////////////////////////////////////////////////////////////

const validateMouse = (store, ev, canvasSize) => {
  if (ev.target.id != 'canvas') return null;
  const state = store.getState();
  if (state.game == null) return null;
  const gridPos = getMouseCell(state.game, ev, canvas);
  if (gridPos == null) return null;
  const {game} = state;

  return {state, game, gridPos};
};

const getMouseCell = (game, ev, canvas, canvasSize): ?Vector => {
  const pixel = getMousePixel(ev, canvas, canvasSize);
  if (pixel == null) return null;
  return canvasToGrid(game, pixel, canvasSize);
};

const getMousePixel = (ev, canvas, canvasSize): ?Vector => {
  const {width: canvasWidth, height: canvasHeight} = canvasSize;
  if (!canvas) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  let x = ev.clientX;
  let y = ev.clientY;
  if (
    ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend'
  ) {
    const touch = ev.touches[0];
    x = touch.clientX;
    y = touch.clientY;
  }
  const canvasPos = {
    x: x - rect.left,
    y: y - rect.top,
  };
  // return null if clicked outside the canvas:
  if (
    canvasPos.x < 0 || canvasPos.y < 0 ||
    canvasPos.x > canvasWidth || canvasPos.y > canvasHeight
  ) {
    return null;
  }
  return canvasPos;
};

module.exports = {initMouseControlsSystem};
