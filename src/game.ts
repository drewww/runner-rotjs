
import * as ROT from 'rot-js';
import { LevelType, Player, Level, IGame, GameScreen, Screen} from './index';

export class Game implements IGame {
    display: ROT.Display;

    screen: Screen = null as any;

    w: number = 80;
    h: number = 24;

    player: Player | null = null;

    engine: ROT.Engine | null = null;

    // I can't figure out how to type this properly
    scheduler = null as any;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());
    }

    init() {
    
        const level = new Level(LevelType.CAVE, this.w, this.h);
        // annoyingly, this does more than just make the map since player starting
        // position is in here. eventually pull this out and make map generation
        // distinct from populating player + beings.

        this.screen = new GameScreen(level)

        const freeCells = level.map.getFreePoints();
        if (!freeCells) {
            console.error("No free cells to place player.");
            return;
        }
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.player = new Player(playerCell.x, playerCell.y, level!, this);
        level.setPlayer(this.player);

        // TODO Eventually consider doing a dirty refresh, where specific cells are called as needing a refresh.
        // Performance may not matter here though.

        this.engine = new ROT.Engine(level.scheduler);

        this.refreshDisplay();

        this.engine.start();

        console.log("Engine started.");
    }

    refreshDisplay() {
        this.display.clear();

        this.screen.draw(this.display);
    }
}

export const G = new Game();
G.init();