
var Game = {
    display: null,

    map: {},

    init: function() {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());

        this._generateMap();
    },

    _generateMap: function() {
        var digger = new ROT.Map.Digger();

        var digCallback = function(x, y, value) {
            if(value) { return; } // do not store walls (TODO consider if this makes sense for me??)
            
            var key = x+","+y;
            this.map[key] = ".";

            // so this map approach is just storing the actual characters. where does color? background? properties? come in
        }

        // bind causes it to run in the context of the Game object.
        digger.create(digCallback.bind(this));

        this._drawWholeMap();
    },

    _drawWholeMap: function() {
        for(var key in this.map) {
            var parts = key.split(",")

            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);

            this.display.draw(x, y, this.map[key]);
        }
    }
}