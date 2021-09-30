#!/bin/bash
AEVERSION=$(cat Alba\ Enhancer\ Chrome\ Extension/manifest.json | grep "\"version" | awk -F'"' '{ print $4 }')
NOW=$(date +%Y%m%d-%H%M%S)
FILE=alba-enhancer-$AEVERSION-$NOW

echo "Building Alba Enhancer v"$AEVERSION"..."
echo "  Cloning source files to temporary folder..."
rsync -a --delete . alba-fixer-build/ --exclude=".*" --exclude="*.sh"

cd alba-fixer-build/

echo "Compressing source files..."
echo "  Compressing JS files..."
#find ./Alba\ Enhancer\ Chrome\ Extension/js -type f ! -path "*/common/*min.*" -name "*.js" -exec uglifyjs {} --compress --output {} \;

echo "  Compressing CSS files..."
#find ./Alba\ Enhancer\ Chrome\ Extension/css -type f -name "*.css" -exec cleancss {} -o {} \;

echo "Creating package file..."
echo "  Compressing extension package..."
zip -rq $FILE.zip Alba\ Enhancer\ Chrome\ Extension

echo "  Moving extension package file to home directory..."
mv $FILE.zip ~/
cd ../

echo "  Cleaning temporary files..."
rm -r alba-fixer-build/

echo "Complete."
