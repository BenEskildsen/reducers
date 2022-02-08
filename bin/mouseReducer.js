'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var mouseReducer = function mouseReducer(mouse, action) {
  switch (action.type) {
    case 'SET_MOUSE_DOWN':
      {
        var isLeft = action.isLeft,
            isDown = action.isDown,
            downPos = action.downPos;

        return _extends({}, mouse, {
          isLeftDown: isLeft ? isDown : mouse.isLeftDown,
          isRightDown: isLeft ? mouse.isRightDOwn : isDown,
          downPos: isDown && downPos != null ? downPos : mouse.downPos
        });
      }
    case 'SET_MOUSE_POS':
      {
        var curPos = action.curPos,
            curPixel = action.curPixel;

        return _extends({}, mouse, {
          prevPos: _extends({}, mouse.curPos),
          curPos: curPos,
          prevPixel: _extends({}, mouse.curPixel),
          curPixel: curPixel
        });
      }
  }
};

module.exports = { mouseReducer: mouseReducer };