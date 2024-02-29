
import * as ROT from 'rot-js';
import { Level, LevelType, Player, IGame, GameScreen, Screen, TitleScreen, GameState} from './index';
import { KillScreen } from './ui/screens/kill-screen';

export class Game implements IGame {
    public display: ROT.Display;

    private screen: Screen = null as any;

    private w: number = 80;
    private h: number = 24;

    player: Player | null = null;

    public engine: ROT.Engine | null = null;

    private titleScreen!: Screen;

    public state!: GameState;

    // I can't figure out how to type this properly
    scheduler = null as any;
    gameScreen!: GameScreen;
    killScreen!: KillScreen;

    constructor() {
        console.log("Game created!");
        
        this.display = new ROT.Display({ width: this.w, height: this.h });
        document.body.appendChild(<Node>this.display.getContainer());

        // in the original tutorial, this was getting added and removed in sync
        // with the engine locking and unlocking. this avoided reacting to keypresses
        // when the engine was simulating versus waiting for player input.
        // will need to bring that back OR sync up the handleEvent logic
        // to reject events when it's not expecting them
        window.addEventListener("keydown", this);
    }

    init() {
        this.killScreen = new KillScreen();
        this.titleScreen = new TitleScreen();
        this.screen = this.titleScreen;

        this.gameScreen = new GameScreen(new Level(LevelType.CAVE, 80, 24), this);

        this.player = new Player(this);
        this.gameScreen.setPlayer(this.player);
        this.state = GameState.TITLE;


        // // the whole scheduler sitting in the level but the engine staying up here
        // // ... it's a litte odd. may push engine down into the level itself?

        this.engine = new ROT.Engine(this.gameScreen.level.scheduler);

        this.engine.start();
        this.engine.lock();

        this.refreshDisplay();

        console.log("Engine started, in locked state for first move.");
    }

    refreshDisplay() {
        this.display.clear();

        try {
            this.screen.draw(this.display);
        } catch(e) {
            console.error("Error drawing screen: " + e);
        }
    }

    handleEvent(e: KeyboardEvent) {
        console.log("Game received event: " + e.keyCode + " in state: " + this.state);
        
        // this is a little not right since this.screen should always be 
        // the current screen
        switch(this.state) {
            case GameState.TITLE:
                // intercept any key to start the game
                this.switchState(GameState.GAME);
                // break out; event is handled. don't pass it to the screen.
                return;
            case GameState.GAME:
                break;
            case GameState.KILLSCREEN:
                // this.switchState(GameState.GAME);
                // nice idea, but need to fully regenerate the game state
                // to restart. TBD.
                break;
        }

        // regardless, give the screen a chance to deal with it.
        this.screen.handleEvent(e);
    }

    public switchState(newState: GameState) {
        console.log("Switching to state: " + newState + " FROM " + this.state);
        this.display.clear();

        // animations can check this to cancel out
        this.screen.disable();

        this.state = newState;
        switch(newState) {
            case GameState.TITLE:
                this.screen = this.titleScreen;
                break;
            case GameState.GAME:
                this.player!.updateVision();
                this.screen = this.gameScreen;                
                break;
            case GameState.KILLSCREEN:
                this.screen = this.killScreen;
                break;
        }
        this.refreshDisplay();
    }
}

export const G = new Game();
G.init();