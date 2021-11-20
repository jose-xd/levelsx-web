const express = require('express');
const router = express.Router();
const customChannelSchema = require('../schemas/custom-channel-schema')
const levelSchema = require('../schemas/profile-schema')
const rolesSchema = require('../schemas/roles-schema')
const fetch = require('node-fetch')
require('dotenv').config();

const { isAuthenticated } = require('../helpers/auth');

router.get('/dashboard', isAuthenticated, (req, res) => {
    let allGuilds = [];
    
    for (let i = 0; i < req.user.guilds.length; i++) {
        let isAdmin;
        if (8 & req.user.guilds[i].permissions) {
            isAdmin = true
        }
        allGuilds[i] = {
            guild: req.user.guilds[i],
            isAdmin: isAdmin
        }
    }
    console.log(allGuilds)
    res.render('dashboard', {
        allGuilds: allGuilds
    });
});

router.get('/dashboard/:id', isAuthenticated, async (req, res) => {
    let urlId = req.params.id;
    let profile = req.user.guilds.find(element => element.id === urlId);
    let headers = {
        Authorization: 'Bot ' + process.env.CLIENT_TOKEN
    }
    
    if (8 & profile.permissions) {

    } else {
        return res.redirect('/dashboard');
    }

    const fetchResultBot = await fetch(`https://discord.com/api/v8/guilds/${urlId}/members/858543288637718548`, {
        method: 'GET',
        headers: headers
    }).then(res => res.json());
    if (!fetchResultBot.user) return res.
        redirect(
            `https://discord.com/oauth2/authorize?client_id=858543288637718548&scope=bot+applications.commands&permissions=8&guild_id=${urlId}&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fdashboard`
            //`https://discord.com/oauth2/authorize?client_id=858543288637718548&scope=bot+applications.commands&permissions=8&guild_id=${urlId}&redirect_uri=http%3A%2F%2Fec2-34-237-242-160.compute-1.amazonaws.com%2Fdashboard`
        );


    const channelData = await customChannelSchema.findOne({
        guildId: urlId
    }).lean().catch(err => res.redirect(`/dashboard/${urlId}`));

    const roleData = await rolesSchema.find({
        guildId: urlId
    }).sort({ level: 'desc' }).lean().catch(err => res.redirect(`/dashboard/${urlId}`));


    const fetchResultChannels1 = await fetch(`https://discord.com/api/v8/guilds/${urlId}/channels`, {
        method: 'GET',
        headers: headers
    }).then(res => res.json());
    let fetchResultChannels = fetchResultChannels1.filter(element => element.type == 0);


    const fetchResultRoles1 = await fetch(`https://discord.com/api/v8/guilds/${urlId}/roles`, {
        method: 'GET',
        headers: headers
    }).then(res => res.json());
    let fetchResultRoles = fetchResultRoles1.filter(element => (!element.tags && element.name != '@everyone'));


    res.render('dashboardId', {
        guild: profile,
        user: req.user,
        channelData: channelData,
        roleData: roleData,
        fetchResultChannels: fetchResultChannels,
        fetchResultRoles: fetchResultRoles
    });
});

router.put('/submit/channel/:id', isAuthenticated, async (req, res) => {
    let guildId = req.params.id;
    let profile = await req.user.guilds.find(element => element.id === guildId);
    if (!profile.owner) return res.redirect(`/dashboard/${guildId}`);
    const { channelId, customMessage } = req.body;
    if (channelId.length <= 0) return res.redirect(`/dashboard/${guildId}`);
    if (channelId.length >= 19) return res.redirect(`/dashboard/${guildId}`);
    if (customMessage.length >= 250) return res.redirect(`/dashboard/${guildId}`);
    if (customMessage.length <= 0) return res.redirect(`/dashboard/${guildId}`);
    await customChannelSchema.findOneAndUpdate(
        {
            guildId: guildId
        },
        {
            channelId: channelId,
            customMessage: customMessage
        },
        {
            upsert: true
        }
    ).lean().catch(err => res.redirect(`/dashboard/${guildId}`));
    req.flash('success_msg', 'Level Role Updated Successfully');
    res.redirect(`/dashboard/${guildId}`);

})

router.put('/submit/roles/:id', isAuthenticated, async (req, res) => {
    let guildId = req.params.id;
    let profile = await req.user.guilds.find(element => element.id === guildId);
    if (!profile.owner) return res.redirect(`/dashboard/${guildId}`)
    const { customLevel, customRole } = req.body;
    let roleInfo = customRole.split("¿¿¿¿¿////////////", 2);
    if (customLevel.length <= 0) return res.redirect(`/dashboard/${guildId}`);
    if (customLevel >= 100) return res.redirect(`/dashboard/${guildId}`);
    if (roleInfo[0].length <= 0) return res.redirect(`/dashboard/${guildId}`);
    if (roleInfo[0].length >= 19) return res.redirect(`/dashboard/${guildId}`);
    await rolesSchema.findOneAndUpdate(
        {
            guildId: guildId,
            level: customLevel
        },
        {
            guildId: guildId,
            level: customLevel,
            roleId: roleInfo[0],
            roleName: roleInfo[1]
        },
        {
            upsert: true
        }
    ).lean().catch(err => res.redirect(`/dashboard/${guildId}`))
    req.flash('success_msg', 'Level Role Updated Successfully');
    res.redirect(`/dashboard/${guildId}`);

})

router.get('/submit/roles/delete/:id/:id2/:level', isAuthenticated, async (req, res) => {
    const arrayId = [req.params.id, req.params.id2, req.params.level]
    if (arrayId[0].length <= 0) return res.redirect(`/dashboard/${guildId}`);
    if (arrayId[1].length <= 0) return res.redirect(`/dashboard/${guildId}`);
    if (arrayId[2].length <= 0) return res.redirect(`/dashboard/${guildId}`);
    let profile = await req.user.guilds.find(element => element.id === arrayId[0]);
    if (8 & profile.permissions) {

    } else {
        res.redirect(`/dashboard/${arrayId[0]}`);
    }
    await rolesSchema.findOneAndDelete(
        {
            guildId: arrayId[0],
            roleId: arrayId[1],
            level: arrayId[2]
        }
    ).lean().catch(err => res.redirect(`/dashboard/${arrayId[0]}`));
    req.flash('success_msg', 'Level Role Updated Successfully');
    res.redirect(`/dashboard/${arrayId[0]}`);

})

router.get('/leaderboard/:id', async (req, res) => {
    let urlId = req.params.id;
    const result = await levelSchema.find({
        guildId: urlId
    }).sort({ level: 'desc' }).sort({ xp: 'desc' }).limit(100).lean();
    let result2 = [];
    for (let i = 0; i < result.length; i++) {
        result2[i] = {
            result: result[i],
            place: i + 1
        }
    }
    res.render('leaderboard', {
        result2: result2
    });
})

module.exports = router;