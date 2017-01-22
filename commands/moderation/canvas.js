/**
 * Created by Julian/Wolke on 24.11.2016.
 */
let Command = require('../../structures/command');
let Canvas = require('canvas');
let Image = Canvas.Image;
let fs = require('fs');
let adminId = require('../../config/main.json').owner_id;
class CanvasTest extends Command {
    constructor({t}) {
        super();
        this.cmd = "canvas";
        this.cat = "moderation";
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        if (msg.author.id !== adminId) return;
        let canvas = new Canvas(200, 200);
        let ctx = canvas.getContext('2d');
        ctx.font = '30px Impact';
        ctx.fillText("owosome!", 50, 100);
        let te = ctx.measureText('owosome!');
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.lineTo(50, 102);
        ctx.lineTo(50 + te.width, 102);
        ctx.stroke();
        ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect(10, 10, 55, 50);
        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 55, 50);
        canvas.toBuffer((err, buf) => {
            if (err) return console.error(err);
            msg.channel.createMessage("", {name: 'uwu.png', file: buf})
        });
    }
}
module.exports = CanvasTest;