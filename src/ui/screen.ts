// A Screen is a collection of display-able elements. It keeps track of all the sub-elements
// and asks them to display themselves. A screen might be a title screen, a game menu,
// and end-game summary screen, or the main game screen itself. The game object orchestrates
// which screen is presented at any given moment.

import { Drawable, SCREEN_HEIGHT, SCREEN_WIDTH } from "..";
import * as ROT from 'rot-js'; // Import the 'rot-js' module
import { COLORS } from "../colors";
import { Overlays } from "./overlays";

export abstract class Screen implements Drawable {
    protected elements: Drawable[];

    protected width: number=SCREEN_WIDTH;
    protected height: number=SCREEN_HEIGHT;

    public x: number = 0;
    public y: number = 0;

    public disabled: boolean = false;

    public overlays: Overlays | undefined

    constructor(width: number = SCREEN_WIDTH, height: number = SCREEN_HEIGHT) {
        this.elements = [];
        this.width = width;
        this.height = height;
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0, bg: string = COLORS.BLACK) {
        for (const component of this.elements) {
            component.draw(display, this.x + xOffset, this.y + yOffset, bg);
        }
    }

    handleEvent(event: KeyboardEvent): void {
        // do nothing by default
        
    }

    public disable(): void {
        for (const element of this.elements) { element.disable(); }

        this.disabled = true;
    }
}