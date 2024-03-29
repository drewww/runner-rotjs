import { COLORS } from "../colors";
import { Player } from "../entities/player";


export const TILE_TYPES = {
    "FLOOR": {symbol: ".", fg: COLORS.WHITE, bg: COLORS.BLACK, opaque: false, solid: false, indestructable: false},
    "WALL": {symbol: "/", fg: COLORS.LIGHT_GREY, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: false},
    "EXIT": {symbol: "%", fg: COLORS.WHITE, bg: COLORS.LIGHT_GREEN, opaque: false, solid: true, indestructable: true, enabled:false, power:3},
    "ENTRANCE": {symbol: "%", fg: COLORS.DARK_GREEN, bg: COLORS.BLACK, opaque: false, solid: true, indestructable: true, enabled:false},
    "BUTTON": {symbol: "○", fg: COLORS.BLACK, bg: COLORS.LIGHT_GREEN, opaque: true, solid: true, indestructable: false},
    "DOOR": {symbol: "-", fg: COLORS.BLACK, bg: COLORS.MOVE_LIGHT_BLUE, opaque: true, solid: true, indestructable: false},
    "EXIT_FORCEFIELD": {symbol: "#", fg: COLORS.LIGHT_GREEN, bg: COLORS.BLACK, opaque: false, solid: true, indestructable: false},
    "BOUNDARY": {symbol: "#", fg: COLORS.LIGHT_GREY, bg: COLORS.WHITE, opaque: true, solid: true, indestructable: true},
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

    public power: number;

    public visible:boolean;
    public discovered:boolean;
    public indestructable: boolean;

    public procGenType: string;
    procGenDistance: number;

    public enabled: boolean;

    public type: string;

    protected callbacks: {[key:string]: Function[]} = {};
    
    public triggerMetadata: {trigger: string, text: string} | null;

    constructor(x:number, y:number, type:string, procGenType:string="unknown") {
        this.x = x;
        this.y = y;

        this.visible = false;
        this.discovered = false;

        this.type = type;
        // assign defaults to calm the linter, then merge in defaults.
        this.opaque = false;
        this.solid = false;
        this.symbol = " ";
        this.fg = COLORS.WHITE;
        this.bg = COLORS.BLACK;
        this.indestructable = false;

        this.procGenType = procGenType;
        this.procGenDistance = -1;
        this.triggerMetadata = null;
        this.enabled = true;

        this.power = 0;

        const tileType = TILE_TYPES[type as keyof typeof TILE_TYPES];
        Object.assign(this, tileType);

        if(procGenType === "PARTITION" && type === "WALL") {
            this.symbol = "#";
        }

        // a stupid hardcode here but it's simpler than abstracting
        if(this.type === "FLOOR") {
            //override the bg color by selecting a black
            this.bg = COLORS.BLACKS[Math.floor(Math.random()*COLORS.BLACKS.length)];
        } else if (this.type === "WALL") {
            this.bg = COLORS.WHITES[Math.floor(Math.random()*COLORS.WHITES.length)];
        }
    }

    protected emit(type: string): void {
        const values = this.callbacks[type];
        if(values) {
            values.forEach(callback => callback(this));
        }
    }

    public addListener(type: string, callback: Function): void {
        let values = this.callbacks[type];
        
        if(!values) {
            values = [];
        }

        values.push(callback);
        this.callbacks[type] = values;
    }
}