const { fetchMember } = require('../../tools');
const { createEmbed } = require('../../utils/embed');
const { boop: images } = require('../../../assets/links.json');

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
				? `${message.member.displayName} has booped ${user}!`
				: `${message.member.displayName} is booping themself!`,
			image: images[Math.floor(Math.random() * images.length)],
		}),
	);
};

module.exports.config = {
	name: 'boop',
};
