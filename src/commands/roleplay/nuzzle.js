const { fetchMember } = require('../../tools');
const { createEmbed } = require('../../utils/embed');
const { nuzzle: images } = require('../../../assets/links.json');

module.exports.run = async ({ message, args }) => {
	// Get user
	let user;
	if (args[0]) {
		user = fetchMember(message, args.join(' '));
	}
	if (user && typeof user !== 'string') {
		user = user.displayName;
	}

	// Send message
	return message.channel.send(
		createEmbed({
			title: user
				? `${message.member.displayName} has nuzzled ${user}!`
				: `${message.member.displayName} is nuzzling themself!`,
			image: images[Math.floor(Math.random() * images.length)],
		}),
	);
};

module.exports.config = {
	name: 'nuzzle',
	aliases: ['cuddle'],
};
