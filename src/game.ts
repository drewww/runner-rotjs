
import * as ROT from 'rot-js';
import { LevelType, Player, Level, IGame, TextBox } from './index';

export class Game implements IGame {
    display: ROT.Display;

    title: TextBox;

    // the currently displayed level
    // contains the map object, as well as the beings being tracked
    level: Level | null = null;

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

        this.title = new TextBox(0, 0, 80, 1, "runner -- a cyberpunk escape roguelike", "#fff", "#000");
    }

    init() {
        

        this.level = new Level(LevelType.CAVE, this.w, this.h);
        // annoyingly, this does more than just make the map since player starting
        // position is in here. eventually pull this out and make map generation
        // distinct from populating player + beings.
        
        // do I need to call this anymore? test
        this.level!.draw(this.display);


        const freeCells = this.level!.map.getFreePoints();
        if (!freeCells) {
            console.error("No free cells to place player.");
            return;
        }
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.player = new Player(playerCell.x, playerCell.y, this.level!, this);
        this.level.setPlayer(this.player);

        // TODO Eventually consider doing a dirty refresh, where specific cells are called as needing a refresh.
        // Performance may not matter here though.

        this.engine = new ROT.Engine(this.level.scheduler);

        this.refreshDisplay();

        this.engine.start();

        console.log("Engine started.");
    }

    refreshDisplay() {
        this.display.clear();

        this.level!.draw(this.display);

        // TODO decide if player gets shoved into level and drawing handled there.
        // probably.
        this.player!.draw(this.display);

        this.title.draw(this.display);
    }
}

export const G = new Game();
G.init();