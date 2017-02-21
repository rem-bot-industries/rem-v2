//The config template, makes sure rem has all the needed config options
module.exports = {
    owner: {
        required: false
    },
    owner_id: {
        required: true
    },
    token: {
        required: true
    },
    client_id: {
        required: true
    },
    bot_id: {
        required: true
    },
    // beta: {
    //     required: false
    // },
    osu_token: {
        required: true
    },
    // osu_path: {
    //     required: false
    // },
    osu_username: {
        required: true
    },
    osu_password: {
        required: true
    },
    environment: {
        required: true
    },
    // discord_bots_token: {
    //     required: true
    // },
    // carbon_token: { Not needed anymore, as the stats are handled by the master.
    //     required: true
    // },
    sentry_token: {
        required: true
    },
    anilist_secret: {
        required: true
    },
    lbsearch_sfw_key: {
        required: true
    },
    lbsearch_nsfw_key: {
        required: true
    },
    mashape_key: {
        required: true
    },
    shard_token: {
        required: true
    },
    soundcloud_key: {
        required: true
    },
    mongo_hostname: {
        required: true
    },
    master_hostname: {
        required: true
    },
    redis_enabled: {
        required: true
    },
    redis_hostname: {
        required: false
    },
    redis_database: {
        required: false
    }
};