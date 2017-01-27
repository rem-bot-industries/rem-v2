/**
 * Created by Julian/Wolke on 24.11.2016.
 */
let Command = require('../../structures/command');
let Canvas = require('canvas');
let Image = Canvas.Image;
let fs = require('fs');
let path = require('path');
let adminId = require('../../../config/main.json').owner_id;
function fontFile(name) {
    return path.join(__dirname, '../../../fonts/', name);
}
Canvas.registerFont(fontFile('LDFComicSans.ttf'), {family: 'comicSans'});
class CanvasTest extends Command {
    constructor({t}) {
        super();
        this.cmd = 'canvas';
        this.cat = 'moderation';
        this.needGuild = true;
        this.t = t;
        this.accessLevel = 0;
        this.hidden = true;
    }

    run(msg) {
        if (msg.author.id !== adminId) return;
        let canvas = new Canvas(200, 200);
        let ctx = canvas.getContext('2d');
        ctx.font = '30px comicSans';
        ctx.fillText('test!', 50, 100);
        let te = ctx.measureText('test!');
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.lineTo(50, 102);
        ctx.lineTo(50 + te.width, 102);
        ctx.stroke();
        canvas.toBuffer((err, buf) => {
            if (err) return console.error(err);
            msg.channel.createMessage('', {name: 'uwu.png', file: buf});
        });
    }
}
module.exports = CanvasTest;