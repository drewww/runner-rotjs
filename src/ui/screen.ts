// A Screen is a collection of display-able elements. It keeps track of all the sub-elements
// and asks them to display themselves. A screen might be a title screen, a game menu,
// and end-game summary screen, or the main game screen itself. The game object orchestrates
// which screen is presented at any given moment.

import { Drawable } from "..";
import * as ROT from 'rot-js'; // Import the 'rot-js' module

export class Screen implements Drawable {
    protected elements: Drawable[];

    constructor() {
        this.elements = [];
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        for (const component of this.elements) {
            component.draw(display, xOffset, yOffset);
        }
    }
}