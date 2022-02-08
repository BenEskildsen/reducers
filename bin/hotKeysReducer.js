'use strict';

var hotKeysReducer = function hotKeysReducer(hotKeys, action) {
	switch (action.type) {
		case 'SET_KEY_PRESS':
			{
				var key = action.key,
				    pressed = action.pressed,
				    once = action.once;

				hotKeys.keysDown[key] = pressed;
				if (once == true) {
					hotKeys.once = true;
				}
				return hotKeys;
			}
		case 'SET_HOTKEY':
			{
				var _key = action.key,
				    press = action.press,
				    fn = action.fn;

				hotKeys[press][_key] = fn;
				return hotKeys;
			}
	}
};

module.exports = { hotKeysReducer: hotKeysReducer };