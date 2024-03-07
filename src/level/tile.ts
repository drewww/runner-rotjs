import { COLORS } from "../colors";
import { Player } from "../entities/player";


export const TILE_TYPES = {
    "FLOOR": {symbol: ".", fg: COLORS.WHITE, bg: COLORS.BLACK, opaque: false, solid: false, indestructable: false},
    "WALL": {symbol: " ", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: false},
    "EXIT": {symbol: "%", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: false, indestructable: true, enabled:true},
    "ENTRANCE": {symbol: "%", fg: COLORS.DARK_GREEN, bg: COLORS.BLACK, opaque: false, solid: true, indestructable: true, enabled:false},
    "BUTTON": {symbol: "○", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: false},
    "DOOR": {symbol: "-", fg: COLORS.BLACK, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: false},
    "FORCEFIELD": {symbol: "#", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: true, indestructable: false},
    "BOUNDARY": {symbol: " ", fg: COLORS.WHITE, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: true},
    "TALL_JUNK": {symbol: "0", fg: COLORS.LIGHT_GREY, bg: COLORS.BLACK, opaque: true, solid: true, indestructable: false},
    "SHORT_JUNK": {symbol: "o", fg: COLORS.LIGHT_GREY, bg: COLORS.BLACK, opaque: false, solid: true, indestructable: false},
}

export interface Interactable {
    interact(player:Player): void;
}

export class Tile {
    public x:number;
    public y:number;

    public opaque:boolean;
    public solid:boolean;
    public symbol:string;
    public fg:string;
    public bg:string;

    public visible:boolean;
    public discovered:boolean;
    public indestructable: boolean;

    public procGenType: string;
    procGenDistance: number;

    public enabled: boolean;

    constructor(x:number, y:number, type:string) {
        this.x = x;
        this.y = y;

        this.visible = false;
        this.discovered = false;

        // assign defaults to calm the linter, then merge in defaults.
        this.opaque = false;
        this.solid = false;
        this.symbol = " ";
        this.fg = COLORS.WHITE;
        this.bg = COLORS.BLACK;
        this.indestructable = false;

        this.procGenType = "unknown";
        this.procGenDistance = -1;
        this.enabled = true;

        const tileType = TILE_TYPES[type as keyof typeof TILE_TYPES];
        Object.assign(this, tileType);
    }
}