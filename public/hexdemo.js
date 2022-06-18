var width = 1200;
var height = 800;

var config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var controls;
//var marker;
var marker2;
var map;
var camera;
var hex_matching;
var wavefunction;
//var posText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('tiles', 'assets/tilemaps/iso/tilesets/basic_hexagon_tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/iso/hexagonal_v2.json');
    //this.load.image('tiles', 'assets/tilemaps/iso/tilesets/tileset.png');
    //this.load.tilemapTiledJSON('map', 'assets/tilemaps/iso/hexagonal.json');
    this.load.image('marker', 'images/marker.png');
    //this.load.image('outline1', 'images/hextile.png');
    this.load.image('outline2', 'images/hex_v2.png');
    //this.load.image('outline3', 'images/hextile3.png');
    //this.load.image('outline3', 'images/hex_v2.png');
    this.load.image('outline3', 'images/hex_v2_thick.png');


    this.load.json('hex_matching', 'wfc/hex_matching.json');
}

function create ()
{
    map = this.add.tilemap('map');

    var tileset = map.addTilesetImage('tileset', 'tiles');

    map.createLayer('Calque 1', tileset);

    var cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setZoom(0.45);
    this.cameras.main.centerOn(0, 0);

    var controlConfig = {
        camera: this.cameras.main,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        acceleration: 0.02,
        drag: 0.0005,
        maxSpeed: 0.7
    };

    controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

    //marker = this.add.sprite(0, 0, 'outline2');
    marker2 = this.add.image(0, 0, 'outline3');

    camera = this.cameras.main;

    hex_matching = this.cache.json.get('hex_matching');

    wavefunction = init_wavefunction();

    for (var i = 0; i < map.layers[0].data.length; i++) {
        for (var j = 0; j < map.layers[0].data[i].length; j++) {
            map.layers[0].data[i][j].index = 1;
        }
    }

    //posText = this.add.text(16, 16, 'pos: (-1, -1)', {fontsize: '32px', 'fill': '#FFF'});

    this.input.on('pointermove', selectHex);
    this.input.on('pointerdown', changeHex)
}

/*
var hexagonWidth = 32;
var hexagonHeight = 34;
var sectorWidth = 32;
var sectorHeight = 25;
var gradient = 1/2;
*/

var hexagonWidth = 48;
var hexagonHeight = 51;
var sectorWidth = 48;
var sectorHeight = 37.5;
var gradient = 1/2;

// % is broken for negative numbers. This fixes it...
function mod(n, m) {
    return ((n % m) + m) % m;
}

function selectHex(pointer) {
    // Works for scrollX = -width/2...
    var camx = (width/2 + camera.scrollX)*camera.zoom;
    var camy = (height/2 + camera.scrollY)*camera.zoom;
    var tx =  (pointer.x + camx - width/2)/camera.zoom;
    var ty = (pointer.y + camy - height/2)/camera.zoom;
    
    //marker.x = tx;
    //marker.y = ty;

    /*
    var iy = Math.round((ty-hexagonHeight/2)/sectorHeight);
    var ix = Math.round((tx-hexagonWidth/2 - iy*hexagonWidth/2)/sectorWidth);
    marker2.x = sectorWidth*ix + iy*hexagonWidth/2 + hexagonWidth/2;
    marker2.y = sectorHeight*iy + hexagonHeight/2;
    */
    
    var ix = Math.floor(tx/sectorWidth);
    var iy = Math.floor(ty/sectorHeight);
    var dx = mod(tx, sectorWidth);
    var dy = mod(ty, sectorHeight);
    //console.log("("+ix+", "+iy+") ("+dx+", "+dy+")");

    
    if(iy%2==0){
        if(dy<(hexagonWidth/4-dx*gradient)){
            ix--;
            iy--;
        }
        if(dy<(-hexagonWidth/4+dx*gradient)){
            iy--;
        }
    }    
    else{
        if(dx>=hexagonWidth/2){
            if(dy<(hexagonHeight/2-dx*gradient)){
                iy--;
            }
        }
        else{
            if(dy<dx*gradient){
                iy--;
            }
            else{
                ix--;
            }
        }
    }
    
    //console.log(ix+", "+iy);
    marker2.x = sectorWidth*ix; // + hexagonWidth/2;
    marker2.y = sectorHeight*iy + hexagonHeight/2; // + hexagonHeight/2;
    if (iy % 2 == 0) {
        marker2.x += hexagonWidth/2;
    }
    else {
        marker2.x += hexagonWidth;
    }
    
    marker2.setTint(0xff0000);
    //posText.setText('Pos: ('+ix+','+iy+')');

    //console.log(ix+", "+iy);
    return {"ix": ix, "iy": iy};
}

function get_hex_selection() {
    var hex_selection_dropdown = document.getElementById("hex_selection_dropdown");
    var hex_selection = hex_selection_dropdown.value;
    return hex_selection;
}
function changeHex(pointer) {
    pos = selectHex(pointer);
    ix = pos['ix'];
    iy = pos['iy'];
    if (iy >= 0 && iy < map.layers[0].data.length && ix >= 0 && ix < map.layers[0].data[iy].length) {
        // Change the tile?
        map.layers[0].data[iy][ix].index = get_hex_selection();
        //checkAllMatching(hex_matching);
    }
}
function split_dynamic_tilemap() {
    var slider_tile_size = document.getElementById("slider_tile_size");
    var tile_size = parseInt(slider_tile_size.value);
    var tiles = [];
    var w = 0;
    var h = 0;
    for (var y = 0; y < map.layers[0].data.length - tile_size; y += tile_size) {
        row = [];
        h++;
        for (var x = 0; x < map.layers[0].data.length - tile_size; x += tile_size) {
            var tile = [];
            w++;
            for (var iy = y; iy < y+tile_size; iy ++) {
                for (var ix = x; ix < x+tile_size; ix ++) {
                    tile.push([iy,ix, map.layers[0].data[iy][ix].index]);
                }
            }
            row.push(tile);
        }
        tiles.push(row);
    }
    
    wavefunction = init_wavefunction(w,h);

    return tiles;
}

function update (time, delta) {
    controls.update(delta);
}

function checkAllMatching(hex_matching) {
    if (!hex_matching) {
        hex_matching = game.cache.json.get('hex_matching');
    }
    //hex_matching;
    for (var i = 0; i < map.layers[0].data.length; i++) {
        for (var j = 0; j < map.layers[0].data[i].length; j++) {
            if (i > 0 || j > 0) break;
            var ti = Math.floor(Math.random()*map.layers[0].data.length);
            var tj = Math.floor(Math.random()*map.layers[0].data[ti].length);
            var valid = checkMatching(hex_matching, ti, tj);
            if (!valid) {
                fixMatching(hex_matching, ti, tj);
            }
        }
    }
}

function checkMatching(hex_matching, x, y) {
    // Assume x and y are valid...  
    var curr = map.layers[0].data[y][x].index - 1;
    if (hex_matching.hasOwnProperty(curr)) {
        //+1
        if (x+1 < map.layers[0].data[y].length) {
            var rel = map.layers[0].data[y][x+1].index;
            if (!hex_matching[curr][0].includes(rel)) {
                return false
            }
        }
        //+z6
        if (y-1 >= 0 && x+1 < map.layers[0].data[y-1].length) {
            var rel = map.layers[0].data[y-1][x+1].index;
            if (!hex_matching[curr][1].includes(rel)) {
                return false
            }
        }
        //+z3
        if (y-1 >= 0) {
            var rel = map.layers[0].data[y-1][x].index;
            if (!hex_matching[curr][2].includes(rel)) {
                return false
            }
        }
        //-1
        if (x-1 >= 0) {
            var rel = map.layers[0].data[y][x-1].index;
            if (!hex_matching[curr][3].includes(rel)) {
                return false
            }
        }
        //-z6
        if (y+1 < map.layers[0].data.length) {
            var rel = map.layers[0].data[y+1][x].index;
            if (!hex_matching[curr][4].includes(rel)) {
                return false
            }
        }
        //-z3
        if (y+1 < map.layers[0].data.length && x+1 < map.layers[0].data[y+1].length) {
            var rel = map.layers[0].data[y+1][x+1].index;
            if (!hex_matching[curr][5].includes(rel)) {
                return false
            }
        }
    }
    return true
}

function fixMatching(hex_matching, x, y) {
    // Assume x and y are valid...  
    var curr = map.layers[0].data[y][x].index - 1;
    if (hex_matching.hasOwnProperty(curr)) {
        //+1
        if (x+1 < map.layers[0].data[y].length) {
            var rel = map.layers[0].data[y][x+1].index;
            if (!hex_matching[curr][0].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][0].length);
                map.layers[0].data[y][x+1].index = 1+hex_matching[curr][0][rand_index];
            }
        }
        //+z6
        if (y-1 >= 0 && x+1 < map.layers[0].data[y-1].length) {
            var rel = map.layers[0].data[y-1][x+1].index;
            if (!hex_matching[curr][1].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][1].length);
                map.layers[0].data[y-1][x+1].index = 1+hex_matching[curr][1][rand_index];
            }
        }
        //+z3
        if (y-1 >= 0) {
            var rel = map.layers[0].data[y-1][x].index;
            if (!hex_matching[curr][2].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][2].length);
                map.layers[0].data[y-1][x].index = 1+hex_matching[curr][2][rand_index];
            }
        }
        //-1
        if (x-1 >= 0) {
            var rel = map.layers[0].data[y][x-1].index;
            if (!hex_matching[curr][3].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][3].length);
                map.layers[0].data[y][x-1].index = 1+hex_matching[curr][3][rand_index];
            }
        }
        //-z6
        if (y+1 < map.layers[0].data.length) {
            var rel = map.layers[0].data[y+1][x].index;
            if (!hex_matching[curr][4].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][4].length);
                map.layers[0].data[y+1][x].index = 1+hex_matching[curr][4][rand_index];
            }
        }
        //-z3
        if (y+1 < map.layers[0].data.length && x+1 < map.layers[0].data[y+1].length) {
            var rel = map.layers[0].data[y+1][x+1].index;
            if (!hex_matching[curr][5].includes(rel)) {
                var rand_index = Math.floor(Math.random()*hex_matching[curr][5].length);
                map.layers[0].data[y+1][x+1].index = 1+hex_matching[curr][5][rand_index];
            }
        }
    }
}

// Can greatly clean up the above with this
var odd_dirs = [{"x": 1, "y": 0}, {"x": 1, "y": -1}, {"x": 0, "y": -1}, {"x": -1, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 1}];
var even_dirs = [{"x": 1, "y": 0}, {"x": 0, "y": -1}, {"x": -1, "y": -1}, {"x": -1, "y": 0}, {"x": -1, "y": 1}, {"x": 0, "y": 1}];
function is_coord_valid(x, y) {
    return x >= 0 && y >= 0 && y < map.layers[0].data.length && x < map.layers[0].data[y].length;
}

// Wavefunction collapse

function init_wavefunction() {
    var wavefunction = [];
    for (var i = 0; i < map.layers[0].data.length; i++) {
        var row = [];
        for (var j = 0; j < map.layers[0].data[i].length; j++) {
            var options = [];
            for (var k = 0; k <= 64; k++) {
                options.push(k);
            }
            row.push(options);
        }
        wavefunction.push(row);
    }
    return wavefunction;
}

function get_min_entropy_coords(wavefunction) {
    min_entropy = 100;
    min_entropy_options = [];
    for (var i = 0; i < wavefunction.length; i++) {
        for (var j = 0; j < wavefunction[i].length; j++) {
            var entropy = wavefunction[i][j].length;
            if (entropy > 1 && entropy < min_entropy) {
                min_entropy = entropy;
                min_entropy_options = [];
                min_entropy_options.push({"x": j, "y": i});
            }
            else if (entropy == min_entropy) {
                min_entropy_options.push({"x": j, "y": i});
            }
        }
    }
    if (min_entropy_options.length > 1) {
        // Select at random
        var rand_index = Math.floor(Math.random()*min_entropy_options.length);
        return min_entropy_options[rand_index];
    }
    else {
        return min_entropy_options[0];
    }
}

function bitsum(x) {
    // x -- 0 to 64
    return (x % 2) + (Math.floor(x / 2) % 2) + (Math.floor(x / 4) % 2) +  (Math.floor(x / 8) % 2) + (Math.floor(x / 16) % 2) + (Math.floor(x / 32) % 2);
}

function collapse_wavefunction(wavefunction, coords) {
    var options = wavefunction[coords.y][coords.x];

    var wall_slider = document.getElementById("slider_wall_bias");
	var floor_slider = document.getElementById("slider_floor_bias");
    var wall_bias = wall_slider.value;
    var floor_bias = floor_slider.value;

    if (options.length > 1) {
        // Some bias, simple example


        
        // Full wall bias
        if (options.includes(0) && Math.random() < wall_bias) {
            wavefunction[coords.y][coords.x] = [0];
            map.layers[0].data[coords.y][coords.x].index = 1;
        }
        // Floor bias
        else if (options.includes(64) && Math.random() < floor_bias) {
            wavefunction[coords.y][coords.x] = [64];
            map.layers[0].data[coords.y][coords.x].index = 65;
        }
        else {
            var rand_index = Math.floor(Math.random()*options.length);
            wavefunction[coords.y][coords.x] = [options[rand_index]];
            map.layers[0].data[coords.y][coords.x].index = 1 + wavefunction[coords.y][coords.x][0];
        }
    }
}

function collapse_wavefunction_to_value(wavefunction, coords, value) {
    wavefunction[coords.y][coords.x] = [value];
}

function propagate_wavefunction(wavefunction, coords, only_walls = false) {
    var stack = [];
    stack.push(coords);
    while (stack.length > 0) {
        var curr_coords = stack.pop();
        var curr_options = wavefunction[curr_coords.y][curr_coords.x];
        //console.log('Stack: ('+curr_coords.x+','+curr_coords.y+')');
        //console.log(curr_options);
        for (var i = 0; i < 6; i++) {
            var dir = (curr_coords.y % 2 == 0) ? even_dirs[i] : odd_dirs[i];
            var new_coords = {"x": curr_coords.x + dir.x, "y": curr_coords.y + dir.y};
            //console.log(i+': ('+new_coords.x+','+new_coords.y+')');
            if (is_coord_valid(new_coords.x, new_coords.y)) {
                var possible_neighbors = get_possible_neighbors(curr_options, i, only_walls);
                //console.log(possible_neighbors);
                var other_options = Array.from(wavefunction[new_coords.y][new_coords.x]);
                for (var j = 0; j < other_options.length; j++) {
                    if (!possible_neighbors.includes(other_options[j])) {
                        var can_remove = constrain_wavefunction(wavefunction, new_coords, other_options[j]);
                        var found = false;
                        for (var k = 0; k < stack.length; k++) {
                            if (stack[k].x == new_coords.x && stack[k].y == new_coords.y) {
                                found = true;
                            }
                        }
                        if (!found && can_remove) {
                            //console.log('Adding to stack: ('+new_coords.x+','+new_coords.y+')')
                            stack.push(new_coords);
                        }
                    }
                }
            }
        }
    }
}

function constrain_wavefunction(wavefunction, coords, option) {
    var idx = wavefunction[coords.y][coords.x].indexOf(option);
    if (idx != -1) {
        if (wavefunction[coords.y][coords.x].length > 1) {
            wavefunction[coords.y][coords.x].splice(idx, 1);
            if (wavefunction[coords.y][coords.x].length == 1) {
                map.layers[0].data[coords.y][coords.x].index = 1 + wavefunction[coords.y][coords.x][0];
            }
            return true;
        }
        else {
            // Trying to delete the last tile... Hm
        }
    }
    return false;
}

function get_possible_neighbors(superposition, direction_index, only_walls = false) {
    var possible_neighbors = [];

    var corner_slider = document.getElementById("slider_corner_bias");
    var corner_bias = corner_slider.value;

    for (var i = 0; i < superposition.length; i++) {
        var valid_neighbors = hex_matching[superposition[i]][direction_index];
        for (var j = 0; j < valid_neighbors.length; j++) {
            if (only_walls && valid_neighbors[j] == 64) {
                continue;
            }
            // Corner bias - 3 to 6
            if (bitsum(valid_neighbors[j]) >= corner_bias) {
                continue;
            }
            if (!possible_neighbors.includes(valid_neighbors[j])) {
                possible_neighbors.push(valid_neighbors[j]);
            }
        }
    }
    return possible_neighbors;
}

function iterate_wavefunction(wavefunction) {
    var coords = get_min_entropy_coords(wavefunction);
    //console.log(coords);
    if (coords) {
        collapse_wavefunction(wavefunction, coords);
        propagate_wavefunction(wavefunction, coords);
    }
}

function iterate_wavefunction_controlled(wavefunction, coords) {
    collapse_wavefunction(wavefunction, coords);
    propagate_wavefunction(wavefunction, coords);
}

function is_wavefunction_collapsed(wavefunction) {
    for (var i = 0; i < wavefunction.length; i++) {
        for (var j = 0; j < wavefunction[i].length; j++) {
            var entropy = wavefunction[i][j].length;
            if (entropy > 1) {
                return false;
            }
        }
    }
    return true;
}

function run_wavefunction_collapse() {
    var iteration = 1;
    var wavefunction = init_wavefunction();
    while (!is_wavefunction_collapsed(wavefunction)) {
        iterate_wavefunction(wavefunction);
        console.log('Iteration '+iteration);
        //console.log(wavefunction);
        iteration++;
    }

    // var rooms = get_rooms(collapsed_wavefunction);
    // console.log(rooms[0].length)
    // for (var t in rooms[0]) {
    //     console.log(rooms[0][t]);
    // }

    var room_size_threshold = document.getElementById('slider_room_size').value;
    
    fill_rooms_below_size(wavefunction, room_size_threshold);
    // remove_walls_below_size(wavefunction, room_size_threshold);
    // fill_rooms_below_width(wavefunction, 3)
    remove_walls_below_width(wavefunction, 3);
    //remove_walls_below_width(wavefunction, 3);
    // remove_walls_below_size(wavefunction, room_size_threshold);
    // fill_rooms_below_width(wavefunction, 3)
    remove_walls_below_size(wavefunction, room_size_threshold);

    var collapsed_wavefunction = [];
    for (var i = 0; i < wavefunction.length; i++) {
        var row = [];
        for (var j = 0; j < wavefunction[i].length; j++) {
            if (wavefunction[i][j].length > 0) {
                row.push(wavefunction[i][j][0]);
            }
            else {
                row.push(-1);
            }
        }
        collapsed_wavefunction.push(row);
    }

    set_tile_map(collapsed_wavefunction);
    return collapsed_wavefunction;
}

function fill_rooms_below_size(wavefunction, size) {
    var rooms = get_rooms(wavefunction, 64, 64);

    for (var i = 0; i < rooms.length; i++) {
        // Fill room with walls
        if (rooms[i].length < size) {
            for (var j = 0; j < rooms[i].length; j++) {
                //wavefunction[rooms[i][j][0]][rooms[i][j][1]] = [0];
                var curr_coords = {"x": rooms[i][j][1], "y": rooms[i][j][0]};
                collapse_wavefunction_to_value(wavefunction, curr_coords, 0); // Full wall
                
                // Look at adjacent tiles
                for (var k = 0; k < 6; k++) {
                    var dir = (curr_coords.y % 2 == 0) ? even_dirs[k] : odd_dirs[k];
                    var new_coords = {"x": curr_coords.x + dir.x, "y": curr_coords.y + dir.y};
                    //console.log(i+': ('+new_coords.x+','+new_coords.y+')');
                    if (is_coord_valid(new_coords.x, new_coords.y)) {
                        // Check to see if neighbor is not in room
                        var in_room = false;
                        for (var j2 = 0; j2 < rooms[i].length; j2++) {
                            if (rooms[i][j2][1] == new_coords.x && rooms[i][j2][0] == new_coords.y) {
                                in_room = true;
                            }
                        }
                        if (!in_room) {
                            // Figure out the tile needed for this to work
                            var adj_value = wavefunction[new_coords.y][new_coords.x][0];
                            var new_value = adj_value;
                            // direction is 0
                            // wall is [a][b][c][d][e][f]
                            // d, c, and b -> 0
                            //Math.pow(2, k)
                            var wall_bit1 = Math.pow(2, (k+2)%6);
                            if ((adj_value & wall_bit1) > 0) {
                                new_value -= wall_bit1;
                            }
                            var wall_bit2 = Math.pow(2, (k+3)%6);
                            if ((adj_value & wall_bit2) > 0) {
                                new_value -= wall_bit2;
                            }
                            var wall_bit3 = Math.pow(2, (k+4)%6);
                            if ((adj_value & wall_bit3) > 0) {
                                new_value -= wall_bit3;
                            }

                            wavefunction[new_coords.y][new_coords.x] = [new_value];
                        }
                    }
                }
            }
        }
    }
}

function fill_rooms_below_width(wavefunction, size) {
    var rooms = get_rooms(wavefunction, 0, 63);
    console.log()
    for (var i = 0; i < rooms.length; i++) {
        for (var x = 0; x < rooms[i].length; x++) {
            var num_walls_adjacent = 0;
            var adjacent = get_adjacent_tiles(rooms[i][x][0], rooms[i][x][1])
            for (var j = 0; j < adjacent.length; j++) {
                if (is_coord_valid(adjacent[j][0], adjacent[j][1])) {
                    if (wavefunction[adjacent[j][0]][adjacent[j][1]] != 64) {
                        num_walls_adjacent += 1;
                    }
                }
            }
            if (num_walls_adjacent < size) {
                var curr_coords = {"x": rooms[i][x][1], "y": rooms[i][x][0]};
                collapse_wavefunction_to_value(wavefunction, curr_coords, 0); // Full wall
                console.log("Collapsed")
            }
        }
    }
}

function remove_walls_below_size(wavefunction, size) {
    var rooms = get_rooms(wavefunction, 0, 63);
    for (var i = 0; i < rooms.length; i++) {
        // Fill room with empty floor tile
        if (rooms[i].length < size) {
            for (var j = 0; j < rooms[i].length; j++) {
                var curr_coords = {"x": rooms[i][j][1], "y": rooms[i][j][0]};
                collapse_wavefunction_to_value(wavefunction, curr_coords, 64); // Empty floor
                //console.log("Collapsed")
            }
        }
    }
}

function remove_walls_below_width(wavefunction, size) {
    var rooms = get_rooms(wavefunction, 0, 63);
    console.log()
    for (var i = 0; i < rooms.length; i++) {
        for (var x = 0; x < rooms[i].length; x++) {
            var num_walls_adjacent = 0;
            var adjacent = get_adjacent_tiles(rooms[i][x][0], rooms[i][x][1])
            for (var j = 0; j < adjacent.length; j++) {
                if (is_coord_valid(adjacent[j][0], adjacent[j][1])) {
                    if (wavefunction[adjacent[j][0]][adjacent[j][1]] < 64) {
                        num_walls_adjacent += 1;
                    }
                }
            }
            if (num_walls_adjacent < size) {
                var curr_coords = {"x": rooms[i][x][1], "y": rooms[i][x][0]};
                collapse_wavefunction_to_value(wavefunction, curr_coords, 64); // Empty floor
                //console.log("Collapsed")
            }
        }
    }
}

function get_rooms(wavefunction, min_val, max_val) {
    var rooms = [];
    var wave_function_copy = [];
    for (var i = 0; i < wavefunction.length; i++) {
        wave_function_copy.push(wavefunction[i].slice());
    }
    for (var i = 0; i < wave_function_copy.length; i++) {
        for (var j = 0; j < wave_function_copy[i].length; j++) {
            if (wave_function_copy[i][j] >= min_val && wave_function_copy[i][j] <= max_val) {
                var room = [];
                get_rooms_helper(wave_function_copy, i, j, room, min_val, max_val);
                rooms.push(room);
            }
        }
    }
    // // Change back to the original value
    // for (var i = 0; i < wave_function_copy.length; i++) {
    //     for (var j = 0; j < wave_function_copy[i].length; j++) {
    //         if (wave_function_copy[i][j] == -1) {
    //             wave_function_copy[i][j] = [64];
    //         }
    //     }
    // }
    //console.log(rooms[0])
    return rooms;
}

function get_rooms_helper(wave_function_copy, i, j, room, min_val, max_val) {
    if(i < 0 || i == wave_function_copy.length || j < 0 || j == wave_function_copy[i].length || !(wave_function_copy[i][j] >= min_val && wave_function_copy[i][j] <= max_val)) {
        return;
    }
    //console.log(wave_function_copy[i][j] >= min_val && wave_function_copy[i][j] <= max_val)
    room.push([i,j]);
    wave_function_copy[i][j] = [-1];
    var adjacent = get_adjacent_tiles(i,j);
    for (var k = 0; k < adjacent.length; k++) {
        get_rooms_helper(wave_function_copy, adjacent[k][0], adjacent[k][1], room, min_val, max_val);
    }
}

function get_adjacent_tiles(i, j) {
    if (i%2==0){
        return [[i-1,j-1], [i-1,j], [i,j+1], [i+1,j], [i+1,j-1], [i,j-1]];
    }
    else {
        return [[i-1,j], [i-1,j+1], [i,j+1], [i+1,j+1], [i+1,j], [i,j-1]];
    }
}

function set_tile_map_with_wavefunction(wavefunction) {
    for (var i = 0; i < wavefunction.length; i++) {
        for (var j = 0; j < wavefunction[i].length; j++) {
            var el = (wavefunction[i][j].length > 0) ? wavefunction[i][j][0] : -1;
            map.layers[0].data[i][j].index = 1 + el;
        }
    }
}

function set_tile_map(tile_array) {
    for (var i = 0; i < tile_array.length; i++) {
        for (var j = 0; j < tile_array[i].length; j++) {
            map.layers[0].data[i][j].index = 1 + tile_array[i][j];
        }
    }
}