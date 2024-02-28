
import { Being, IGame, Level } from '../index.ts';

export class Player extends Being {
    game: IGame;

    constructor(x:number, y:number, level:Level, game:IGame) {
        super(x, y, "@", "#ff0", "#000", level);
        this.game = game;
    }

    act(): void {
        this.game.refreshDisplay();

        if (this.game.engine) {
            this.game.engine.lock();
        } else {
            console.error("Game object missing engine.");
        }

        super.act();
    }
}