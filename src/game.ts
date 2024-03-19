
import * as ROT from 'rot-js';
import { Screen } from './ui/screen';
import { KillScreen } from './ui/screens/kill-screen';
import { WinScreen } from './ui/screens/win-screen';
import { GameState, IGame, LevelType, SCREEN_HEIGHT, SCREEN_WIDTH } from '.';
import { Player } from './entities/player';
import { GameScreen } from './ui/screens/game-screen';
import { TitleScreen } from './ui/screens/title-screen';
import { MapExploreScreen } from './ui/screens/map-explore-screen';

export class Game implements IGame {
    public display: ROT.Display;

    private screen: Screen = null as any;

    private w: number = SCREEN_WIDTH;
    private h: number = SCREEN_HEIGHT;

    player: Player | null = null;

    private titleScreen!: Screen;

    public state!: GameState;

    // I can't figure out how to type this properly
    scheduler = null as any;
    gameScreen!: GameScreen;
    killScreen!: KillScreen;
    winScreen!: WinScreen;
    mapExploreScreen!: MapExploreScreen;
    tutorialScreen!: GameScreen; 

    endScreenShowTime: number = 0;
    
    constructor() {
        console.log("Game created!");
        
        // on load figure out the width of the screen and then calculate a font size that will use that full width.
        const screenWidth = window.innerWidth;
        const fontSize = Math.floor(screenWidth / (this.w+1)); 

        this.display = new ROT.Display({ width: this.w, height: this.h, 
            layout: "rect",
            // fontFamily: "squaremodern",
            fontSize: fontSize,
            forceSquareRatio: true,
        });

        const displayNode = <Node>this.display.getContainer();
        document.body.appendChild(displayNode);
        this.display.getContainer()!.id="game"

        // const canvas = this.display.getContainer();
        // if(canvas) { canvas.style = "image-rendering: crisp-edges"; } 

        // in the original tutorial, this was getting added and removed in sync
        // with the engine locking and unlocking. this avoided reacting to keypresses
        // when the engine was simulating versus waiting for player input.
        // will need to bring that back OR sync up the handleEvent logic
        // to reject events when it's not expecting them
        window.addEventListener("keydown", this);
        window.addEventListener("resize", () => {
            console.log("Resizing window.");

            this.display.setOptions({ fontSize: Math.floor(window.innerWidth / (this.w+1)) });

            this.screen.overlays!.resize();
        });
    }

    init() {
        this.killScreen = new KillScreen();
        this.titleScreen = new TitleScreen();
        this.winScreen = new WinScreen();
        this.mapExploreScreen = new MapExploreScreen(this);
        this.screen = this.titleScreen;

        this.tutorialScreen = new GameScreen(this, LevelType.TUTORIAL);

        this.gameScreen = new GameScreen(this, LevelType.VAULT);

        this.state = GameState.TITLE;

        this.refreshDisplay();

        console.log("Engine started, in locked state for first move.");
    }

    refreshDisplay() {
        this.display.clear();
        
        try {
            this.screen.draw(this.display);
        } catch(e) {
            console.error("Error drawing screen: ");
            console.error(e);
        }
    }

    handleEvent(e: KeyboardEvent) {
        // console.log("Game received event: " + e.keyCode + " in state: " + this.state);
        
        // this is a little not right since this.screen should always be 
        // the current screen
        switch(this.state) {
            case GameState.TITLE:
                // intercept any key to start the game
                if (e.keyCode == ROT.KEYS.VK_M) {
                    this.switchState(GameState.MAP_EXPLORE);
                } else if (e.keyCode == ROT.KEYS.VK_T) {
                    console.log("got T");
                    // const loadedGameScreen: GameScreen = <GameScreen>this.tutorialScreen;

                    this.switchState(GameState.TUTORIAL);
                    // loadedGameScreen.level.setPlayer(this.player!);

                    // eat the event
                    return;
                } else if (e.keyCode == ROT.KEYS.VK_I) {
                    // a bit odd ... this just falls through into the handle for the screen itself, which
                    // will turn itself into the "information" version
                } else {
                    this.switchState(GameState.GAME);
                    
                    // consider setting player on game??

                    // event is handled, don't pass it to the screen
                    return;
                }
                
                break;
            case GameState.TUTORIAL:
            case GameState.GAME:
                break;
            case GameState.KILLSCREEN:
            case GameState.WINSCREEN:
                if(Date.now() - this.endScreenShowTime > 1000) {
                    window.location.reload();
                }
                break;
        }

        // regardless, give the screen a chance to deal with it.
        this.screen.handleEvent(e);
        this.refreshDisplay();
    }

    public switchState(newState: GameState) {
        console.log("Switching to state: " + newState + " from " + this.state);
        this.display.clear();

        // animations can check this to cancel out
        this.screen.disable();

        this.state = newState;
        switch(newState) {
            case GameState.TITLE:
            
                this.screen = this.titleScreen;
                break;
            case GameState.GAME:
                this.player = new Player();
                this.gameScreen.setPlayer(this.player!);
                this.player!.updateVision();
                this.screen = this.gameScreen;                
                break;
            case GameState.KILLSCREEN:
                this.screen = this.killScreen;
                this.endScreenShowTime = Date.now();
                break;
            case GameState.WINSCREEN:
                this.screen = this.winScreen;
                this.endScreenShowTime = Date.now();
                break;
            case GameState.MAP_EXPLORE:
                this.screen = this.mapExploreScreen;
                break;
            case GameState.TUTORIAL:
                this.player = new Player();

                this.tutorialScreen.setPlayer(this.player!);
                this.player!.updateVision();
                this.screen = this.tutorialScreen;
                break;
        }
        this.refreshDisplay();
    }
}

export var G = new Game();
G.init();