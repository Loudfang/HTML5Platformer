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
        this._super(p, {asset: "player.png", x: 110, y: 50, jumpSpeed: -380, lives: 3, coins: 0});
        this.add('2d, platformerControls');

        this.on("hit.sprite", function (collision) {
            if (collision.obj.isA("Coin")) {
                collision.obj.destroy();
                this.p.coins++;
                var coinsLabel = Q("UI.Text", 1).items[1];
                coinsLabel.p.label = 'Coins x' + this.p.coins;
            }
        });
    },
    step: function (dt) {
        if (Q.inputs['left'] && this.p.direction == 'right') {
            this.p.flip = 'x';
        }
        if (Q.inputs['right'] && this.p.direction == 'left') {
            this.p.flip = false;
        }
        if (this.p.timeInvincible > 0) {
            this.p.timeInvincible = Math.max(this.p.timeInvincible - dt, 0);
        }
    },
    damage: function () {
        // does a check for invince
        if (!this.p.timeInvincible) {
            this.p.lives--;

            //time invince will be 1 second
            this.p.timeInvincible = 1;

            if (this.p.lives < 0) {
                //RIP IN PEPERONIS
                this.destroy();
                Q.stageScene("endGame", 1, {label: "YOU DIED LOSER"});
            }
            else {
                var livesLabel = Q("UI.Text", 1).first();
                livesLabel.p.label = "Lives x " + this.p.lives;
            }
        }
    }
});

//the delicious coins
Q.Sprite.extend("Coin", {
    init: function (p) {
        this._super(p, {asset: "coin.png"});
    }
});

Q.component("commonEnemy", {
    added: function () {
        var entity = this.entity;
        entity.on("bump.left,bump.right,bump.bottom", function (collision) {
            if (collision.obj.isA("Player")) {
                collision.obj.damage();
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

    //Loading monsters and other assets via JSON
    //level assets. format must be as shown: [[ClassName, params], .. ] 
    var levelAssets = [
        ["GroundEnemy", {x: 18 * 70, y: 6 * 70, asset: "slime.png"}],
        ["VerticalEnemy", {x: 800, y: 120, rangeY: 70, asset: "fly.png"}],
        ["VerticalEnemy", {x: 1080, y: 120, rangeY: 80, asset: "fly.png"}],
        ["GroundEnemy", {x: 6 * 70, y: 3 * 70, asset: "slime.png"}],
        ["GroundEnemy", {x: 8 * 70, y: 70, asset: "slime.png"}],
        ["GroundEnemy", {x: 18 * 70, y: 120, asset: "slime.png"}],
        ["GroundEnemy", {x: 12 * 70, y: 120, asset: "slime.png"}],
        ["Coin", {x: 300, y: 100}],
        ["Coin", {x: 360, y: 100}],
        ["Coin", {x: 420, y: 100}],
        ["Coin", {x: 480, y: 100}],
        ["Coin", {x: 800, y: 300}],
        ["Coin", {x: 860, y: 300}],
        ["Coin", {x: 920, y: 300}],
        ["Coin", {x: 980, y: 300}],
        ["Coin", {x: 1040, y: 300}],
        ["Coin", {x: 1100, y: 300}],
        ["Coin", {x: 1160, y: 300}],
        ["Coin", {x: 1250, y: 400}],
        ["Coin", {x: 1310, y: 400}],
        ["Coin", {x: 1370, y: 400}]
    ];

    //load level assets
    stage.loadAssets(levelAssets);
});
//game over scene
Q.scene("endGame", function (stage) {
    alert("game over");
    window.location = "";
});

Q.scene("gameStats", function (stage) {
    var statsContainer = stage.insert(new Q.UI.Container({fill: "gray",
        x: 960 / 2,
        y: 620,
        border: 1,
        shadow: 3,
        shadowColor: "rgba(0,0,0,0.5)",
        w: 960,
        h: 40
    })
            );


    var lives = stage.insert(new Q.UI.Text({
        label: "Lives x 3",
        color: "white",
        x: -300,
        y: 0
    }), statsContainer);

    var coins = stage.insert(new Q.UI.Text({
        label: "Coins x 0",
        color: "white",
        x: 300,
        y: 0
    }), statsContainer);

});


//load assets
Q.load("tiles_map.png, player.png, fly.png, slime.png, coin.png, level1.tmx", function () {
    Q.sheet("tiles", "tiles_map.png", {tilew: 70, tileh: 70});
    Q.stageScene("level1");
    Q.stageScene("gameStats", 1);


});