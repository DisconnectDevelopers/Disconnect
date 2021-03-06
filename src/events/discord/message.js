// Variables
const { client } = require('../../bot');
const logger = require('../../utils/logger');
const { improperUsage, missingPermissions } = require('../../utils/embed');
const settings = require('../../../assets/config.json');

// On Message
client.on('message', async (message) => {
	// Pre Command Checks
	if (message.author.bot || message.channel.type === 'dm') {
		return;
	}

	// Muted servers
	if (message.guild.id === '722704869835669554') {
		return;
	}

	// Pre command permission checks
	if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) {
		return;
	}

	// Get guild data
	const { get: getGuild } = require('../../models/guilds');
	const guildData = await getGuild(message.guild);

	// Get User Data
	const { get: getUser } = require('../../models/users');
	const userData = await getUser(message.author);

	// Define information
	const mention = `<@!${client.user.id}>`;
	const prefix = guildData.prefix ? guildData.prefix : settings.prefix;
	const args = message.content.slice(prefix.length).trim().split(' ');

	// If it starts with a ping
	if (message.content.startsWith(mention)) {
		return message.channel.send(
			`Hello, I am **${client.user.username}**! Please use \`${prefix}help\` for help!`,
		);
	}

	// If it doesn't start with prefix return;
	if (!message.content.startsWith(prefix) || !args[0]) {
		return;
	}

	// Remove spaces
	for (const arg of args) {
		if (arg === '') {
			args.splice(args.indexOf(arg), 1);
		}
	}

	// Get the command
	const cmd = args.shift().toLowerCase();
	const command = client.commands.get(cmd) || client.aliases.get(cmd);
	if (!command) {
		return;
	}

	// Check permissions
	const clientMember = message.guild.members.cache.get(client.user.id);

	// Make sure the bot can send embeds
	if (!message.channel.permissionsFor(client.user).has('EMBED_LINKS')) {
		return message.channel.send(
			'Many of my responses require permission to embed links. Please give me permission to do this if you would like me to run this command.',
		);
	}

	// Make sure bot is able to respond
	if (
		!clientMember.hasPermission('SEND_MESSAGES') ||
		!clientMember.hasPermission('EMBED_LINKS')
	) {
		return;
	}

	// Check user permissions
	if (command.config.permissions) {
		const missing = [];

		for (const permission of command.config.permissions) {
			if (
				!message.channel.permissionsFor(message.author).has(permission)
			) {
				missing.push(permission);
			}
		}

		if (missing.length > 0) {
			return message.channel.send(missingPermissions('You are', missing));
		}
	}

	// Check client permissions
	if (command.config.clientPerms) {
		const missing = [];

		for (const permission of command.config.clientPerms) {
			if (!message.channel.permissionsFor(client.user).has(permission)) {
				missing.push(permission);
			}
		}

		if (missing.length > 0) {
			return message.channel.send(missingPermissions('I am', missing));
		}
	}
	// Check NSFW
	if (command.config.isNSFW && message.channel.nsfw === false) {
		return message.channel.send(
			improperUsage('This command may only be used in nsfw channels.'),
		);
	}

	// Check Developer Only
	if (command.config.isDev && message.author.id !== settings.creatorID) {
		return;
	}

	// Check music permissions
	const queue = client.queue.get(message.guild.id);
	if (command.config.isPlaying) {
		// Check and make sure user is in a voice channel
		const channel = message.member.voice.channel;
		if (!channel) {
			return message.channel.send(
				improperUsage(
					'Please join a voice channel to use this command.',
				),
			);
		}

		// Make sure bot is in a voice channel
		if (!message.guild.me.voice.channel) {
			return message.channel.send(
				improperUsage(
					'I am not currently playing music in a voice channel.',
				),
			);
		}

		// Make sure the bot is in the same channel as the user
		if (channel.id !== message.guild.me.voice.channel.id) {
			return message.channel.send(
				improperUsage(
					'Please join the same voice channel as me to use this command.',
				),
			);
		}

		// Check if there is a queue
		if (!queue) {
			return message.channel.send(
				improperUsage(
					`There is no music playing in this server. Use \`${prefix}play <song name or url>\` to play some music!`,
				),
			);
		}
	}

	// Run Execute the command
	command
		.run({ client, message, args, guildData, userData, queue })
		.catch((err) => {
			logger.client.info(err.stack);
			logger.client.error(
				`${err.message} While trying to use command ${command.config.name} in command ${message.guild.id}`,
			);
			return message.channel.send(
				improperUsage(
					'An error has occurred while running the command. Please try again later.',
				),
			);
		});
});
