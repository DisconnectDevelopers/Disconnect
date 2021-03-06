const { MessageEmbed } = require('discord.js');
const { secondary } = require('../../../assets/colors.json');

module.exports.run = async ({ client, message, args }) => {
	const symbols = [
		client.emojis.cache.get('860359165599809567'),
		':paper:',
		':scissors:',
	];

	const translateSymbols = {
		rock: client.emojis.cache.get('860359165599809567'),
		paper: ':paper:',
		scissors: ':scissors:',
	};

	const filter = (reaction, user) => {
		return (
			(reaction.emoji === symbols[0] && user.id === message.author.id) ||
			(reaction.emoji.name === '📄' && user.id === message.author.id) ||
			(reaction.emoji.name === '✂' && user.id === message.author.id)
		);
	};

	const choice = args.join(' ').toLowerCase();
	const rpsChoice = symbols[Math.floor(Math.random() * 3)];

	const e = new MessageEmbed()
		.setTitle('Rock Paper Scissors')
		.setColor(secondary);

	async function missingRPS() {
		e.setDescription('Please select your pick below.');
		const msg = await message.channel.send(e);
		await msg.react(symbols[0]).then(async () => {
			setTimeout(
				async () =>
					await msg.react('📄').then(async () => {
						setTimeout(async () => await msg.react('✂'), 1000);
					}),
				1000,
			);
		});

		const collector = msg.createReactionCollector(filter, {
			time: 60000,
		});

		collector.on('collect', async (reaction) => {
			await msg.reactions.removeAll();
			e.setDescription(
				`I pick ${rpsChoice}! You picked: ${reaction.emoji}`,
			);
			return msg.edit(e);
		});

		collector.on('end', () => {
			// Nothing
		});
	}

	if (choice) {
		if (choice !== 'rock' && choice !== 'paper' && choice !== 'scissors') {
			return await missingRPS();
		} else {
			e.setDescription(
				`I pick ${rpsChoice}! You picked: ${translateSymbols[choice]}`,
			);
			return message.channel.send(e);
		}
	} else {
		return await missingRPS();
	}
};

module.exports.config = {
	name: 'rock-paper-scissors',
	aliases: ['r-p-s'],
};
