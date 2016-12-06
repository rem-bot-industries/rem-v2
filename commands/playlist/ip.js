/**
 * Created by julia on 07.11.2016.
 */
let Command = require('../../Objects/command');
let playlistReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/?(?:playlist|list|)\?list=([0-9a-zA-Z-_]*)/;
let winston = require('winston');
let PlaylistImport = require('../../modules/playlistImporter');
let SongImporter = require('../../modules/songImporter');
let songModel = require('../../DB/song');
let Selector = require('../../modules/selector');
let async = require("async");
class ImportPlaylist extends Command {
    constructor(t, v) {
        super();
        this.cmd = "ip";
        this.cat = "playlist";
        this.needGuild = true;
        this.t = t;
        this.v = v;
        this.accessLevel = 0;
        this.importer = null;
        this.hidden = true;
    }

    run(msg) {
        let msgSplit = msg.content.split(' ');
        let messageSearch = "";
        for (let i = 1; i < msgSplit.length; i++) {
            messageSearch = messageSearch + " " + msgSplit[i]
        }
        messageSearch = messageSearch.trim().replace('<', '').replace('>', '');
        if (playlistReg.test(messageSearch)) {
            let selector = new Selector(msg, [{name: 'Import Playlist ?'}], this.t, (err, number) => {
                if (err) return msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
                if (number === 1) {
                    let m;
                    console.log(messageSearch);
                    if ((m = playlistReg.exec(messageSearch)) !== null) {
                        winston.info(`using Playlist ${m[1]}`);
                        msg.channel.createMessage('Ok, I will now import the playlist, this will take a bit..');
                        this.playlist(msg, m[1]);
                    } else {
                        console.log(m);
                        this.emit('error', 'generic.error');
                    }
                }
            });
        } else {
            msg.channel.createMessage('That is not a Playlist link.');
        }
    }

    playlist(msg, id) {
        this.importer = new PlaylistImport(id);
        this.importer.once('error', (err) => {
            msg.channel.createMessage(this.t(err, {lngs: msg.lang}));
            this.importer.removeAllListeners();
        });
        this.importer.once('done', (playlist, songs) => {
            msg.channel.createMessage(`Alright, I just imported the playlist with the id ${playlist.id}, with a total of ${songs.length} Songs`);
            this.loadSongsBatch(songs, (err, songs) => {
                if (err) return winston.info(err);
                this.v.addToQueueBatch(msg, songs);
            });
        });
    }

    loadSongsBatch(songs, cb) {
        songModel.find({id: {"$in": songs}}, cb);
    }

}
module.exports = ImportPlaylist;