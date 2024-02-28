
import * as ROT from 'rot-js';
import { LevelType, Player, Level, IGame, GameScreen, Screen, TitleScreen} from './index';

export class Game implements IGame {
    public display: ROT.Display;

    private screen: Screen = null as any;

    private w: number = 80;
    private h: number = 24;

    player: Player | null = null;

    public engine: ROT.Engine | null = null;

    private titleScreen: Screen;

    // I can't figure out how to type this properly
    scheduler = null as any;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());

        // in the original tutorial, this was getting added and removed in sync
        // with the engine locking and unlocking. this avoided reacting to keypresses
        // when the engine was simulating versus waiting for player input.
        // will need to bring that back OR sync up the handleEvent logic
        // to reject events when it's not expecting them.
        window.addEventListener("keydown", this);
        this.titleScreen = new TitleScreen();
    }

    init() {
    
        // todo clean up the fact that level has to be created before
        // player.
        const level = new Level(LevelType.CAVE, this.w, this.h);
        // annoyingly, this does more than just make the map since player starting
        // position is in here. eventually pull this out and make map generation
        // distinct from populating player + beings.

        this.screen = new GameScreen(level, this)

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

    handleEvent(e: KeyboardEvent) {
        this.screen.handleEvent(e);
    }
}

export const G = new Game();
G.init();