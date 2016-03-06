var Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Touch, UI")
        .setup({
            width: 960,
            height: 640,
            development: true
        }).controls().touch();


//player
Q.Sprite.extend("Player", {
    init: function (p) {
        this._super(p, {asset: "player.png", x: 110, y: 50, jumpSpeed: -380});
        this.add('2d, platformerControls');
    },
    step: function (dt) {
        if (Q.inputs['left'] && this.p.direction == 'right') {
            this.p.flip = 'x';
        }
        if (Q.inputs['right'] && this.p.direction == 'left') {
            this.p.flip = false;
        }
    }
});

Q.component("commonEnemy", {
    added: function () {
        var entity = this.entity;
        entity.on("bump.left,bump.right,bump.bottom", function (collision) {
            if (collision.obj.isA("Player")) {
                Q.stageScene("endGame", 1, {label: "Game Over"});

                //RIP player
                collision.obj.destroy();
            }
        });
        entity.on("bump.top", function (collision) {
            if (collision.obj.isA("Player")) {
                //jump back
                collision.obj.p.vy = -100;
                //RIP Creature
                this.destroy();
            }
        });
    }
});

//enemy that goes up and down
Q.Sprite.extend("VerticalEnemy", {
    init: function (p) {
        this._super(p, {vy: -100, rangeY: 200, gravity: 0});
        this.add("2d, commonEnemy");
        this.p.initialY = this.p.y;
    },
    step: function (dt) {
        if (this.p.y - this.p.initialY >= this.p.rangeY && this.p.vy > 0) {
            this.p.vy = -this.p.vy;
        }
        else if (-this.p.y + this.p.initialY >= this.p.rangeY && this.p.vy < 0) {
            this.p.vy = -this.p.vy;
        }
    }
});

//ground walker
Q.Sprite.extend("GroundEnemy", {
    init: function (p) {
        this._super(p, {vx: -100, deafaultDirection: "left"});
        this.add("2d,aiBounce,commonEnemy");
    },
    step: function (dt) {
        var dirX = this.p.vx / Math.abs(this.p.vx);
        var ground = Q.stage().locate(this.p.x, this.p.y + this.p.h / 2 + 1, Q.SPRITE_DEFAULT);
        var nextTile = Q.stage().locate(this.p.x + dirX * this.p.w / 2 + dirX, this.p.y + this.p.h / 2 + 1, Q.SPRITE_DEFAULT);

        //if we are on ground and there is a cliff
        if (!nextTile && ground) {
            if (this.p.vx > 0) {
                if (this.p.defaultDirection === "right") {
                    this.p.flip = "x";
                }
                else {
                    this.p.flip = false;
                }
            }
            else {
                if (this.p.defaultDirection === "left") {
                    this.p.flip = "x";
                }
                else {
                    this.p.flip = false;
                }
            }
            this.p.vx = -this.p.vx;
        }
    }
});


Q.scene("level1", function (stage) {


    var background = new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE});
    stage.insert(background);

    stage.collisionLayer(new Q.TileLayer({dataAsset: 'level1.tmx', layerIndex: 1, sheet: 'tiles', tileW: 70, tileH: 70}));

    var player = stage.insert(new Q.Player());

    stage.add("viewport").follow(player, {x: true, y: true}, {minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});

    //Loading monster assets via JSON
    //level assets. format must be as shown: [[ClassName, params], .. ] 
    var levelAssets = [
        ["GroundEnemy", {x: 18 * 70, y: 6 * 70, asset: "slime.png"}],
        ["VerticalEnemy", {x: 800, y: 120, rangeY: 70, asset: "fly.png"}],
        ["VerticalEnemy", {x: 1080, y: 120, rangeY: 80, asset: "fly.png"}],
        ["GroundEnemy", {x: 6 * 70, y: 3 * 70, asset: "slime.png"}],
        ["GroundEnemy", {x: 8 * 70, y: 70, asset: "slime.png"}],
        ["GroundEnemy", {x: 18 * 70, y: 120, asset: "slime.png"}],
        ["GroundEnemy", {x: 12 * 70, y: 120, asset: "slime.png"}]
    ];

    //load level assets
    stage.loadAssets(levelAssets);
});
//game over scene
Q.scene("endGame", function (stage) {
    alert("game over");
    window.location = "";
});


//load assets
Q.load("tiles_map.png, player.png, fly.png, slime.png, level1.tmx", function () {
    Q.sheet("tiles", "tiles_map.png", {tilew: 70, tileh: 70});
    Q.stageScene("level1");


});