/**
 * Generated from the Phaser Sandbox
 *
 * //phaser.io/sandbox/zsKPTrrN
 *
 * This source requires Phaser 2.6.2
 */

var game = new Phaser.Game(1080, 1920, Phaser.AUTO, '', { preload : preload, create : create, update : update, render : render });

function create()
{
}
function update()
{
}

function render()
{
    var style = { font : "bold 32px Arial", fill : "#fff", boundsAlignH : "center", boundsAlignV : "middle" };
    var style2 = { font : "18px Times New Roman", fill : "#fff", boundsAlignH : "center", boundsAlignV : "middle", stroke : '#000000', strokeThickness : 0 };

   // text = game.add.text(0, 0, "CSIS rpg", style);

    game.debug.text("CSIS RPGS", 300, 100, 'rgb(255,255,255)');

}
