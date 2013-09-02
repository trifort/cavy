#!/bin/bash

#設定
outputFileName="../cavy.js"
COMPILE_DIR="../js"
JSDOC_DIRNAME="JSDocToolKit3";
compileLevel="SIMPLE_OPTIMIZATIONS"

#バッチディレクトリへ移動
MY_DIRNAME=$(dirname $0)

cd $MY_DIRNAME

echo "コンパイル開始"
paths=""
separate=" --js "

paths=${paths}${separate}../src/Core.js
paths=${paths}${separate}../src/EventDispatcher.js
paths=${paths}${separate}../src/Preload.js
paths=${paths}${separate}../src/Matrix.js
paths=${paths}${separate}../src/Timer.js
paths=${paths}${separate}../src/Timeline.js
paths=${paths}${separate}../src/Tween.js
paths=${paths}${separate}../src/Scene.js
paths=${paths}${separate}../src/DisplayObject.js
paths=${paths}${separate}../src/InteractiveObject.js
paths=${paths}${separate}../src/Stage.js
paths=${paths}${separate}../src/Graphic.js
paths=${paths}${separate}../src/BackgroundColor.js
paths=${paths}${separate}../src/LinearGradient.js
paths=${paths}${separate}../src/CircleGradient.js
paths=${paths}${separate}../src/Shape.js
paths=${paths}${separate}../src/Rectangle.js
paths=${paths}${separate}../src/Circle.js
paths=${paths}${separate}../src/Sprite.js
paths=${paths}${separate}../src/SpriteSheet.js
paths=${paths}${separate}../src/Text.js

java -jar compiler.jar ${paths} --language_in ECMASCRIPT5_STRICT --compilation_level ${compileLevel} --js_output_file ${outputFileName}

echo "コンパイル完了"

cd $MY_DIRNAME
#JSDocToolKitディレクトリへ移動
cd $JSDOC_DIRNAME
echo "ドキュメント生成中..."
#./jsdoc ../../src/ -t templates/docstrap/template -c conf.json -d ../../doc
#./jsdoc ../../src/ -t templates/default -c conf.json -d ../../doc
./jsdoc ../../src/ ../../README.md -t templates/bootstrap -c conf.json -d ../../doc
echo "ドキュメント生成完了"
