import {Game} from './snake.mjs';
// Driver
console.log('starting')

var manualControl = false;
var visible = true;

if (visible) {
    $(document).ready(() => {


        var game = new Game(visible, manualControl);
        game.start();

        if (manualControl) {

            document.onkeydown = checkKey;

            function checkKey(e) {

                e = e || window.event;

                if (e.keyCode == '38') {
                    game.snake.facing = 2;
                } else if (e.keyCode == '40') {
                    game.snake.facing = 0;
                } else if (e.keyCode == '37') {
                    game.snake.facing = 3;
                } else if (e.keyCode == '39') {
                    game.snake.facing = 1;
                }

            }
        }
    })
}