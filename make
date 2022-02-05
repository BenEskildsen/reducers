#!/bin/bash

# npm run babel -- --plugins transform-react-jsx

rm -rf bin/
mkdir bin

# flow transform
# npm run babel -- --presets flow
npm run babel -- src/ -d bin






