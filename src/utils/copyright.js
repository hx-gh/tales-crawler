const chalk = require('chalk');
const figlet = require('figlet');
async function copyright(setIntervalValue) {
	setTimeout(() => {
		figlet.text(
			'4i20 Company',
			{
				font: 'slant',
				horizontalLayout: 'default',
				verticalLayout: 'default',
				width: 108,
				whitespaceBreak: true,
			},
			function (err, data) {
				if (err) {
					console.log('Something went wrong...');
					console.dir(err);
					return;
				}
				console.log(chalk.green(data));
			}
		);
	}, 5000);
	setTimeout(() => {
		figlet.text(
			'250 NO PIX \n Para usar <3',
			{
				font: 'slant',
				horizontalLayout: 'default',
				verticalLayout: 'default',
				width: 108,
				whitespaceBreak: true,
			},
			function (err, data) {
				if (err) {
					console.log('Something went wrong...');
					console.dir(err);
					return;
				}
				console.log(chalk.green(data));
			}
		);
	}, 10000);
	setTimeout(() => {
		const calculateInterval = (setIntervalValue - 15000) / 1000;
		figlet.text(
			`SUA APLICAÇÃO VAI RODAR DENTRO DE ${calculateInterval} segundos`,
			{
				font: 'slant',
				horizontalLayout: 'default',
				verticalLayout: 'default',
				width: 108,
				whitespaceBreak: true,
			},
			function (err, data) {
				if (err) {
					console.log('Something went wrong...');
					console.dir(err);
					return;
				}
				console.log(chalk.green(data));
			}
		);
	}, 15000);
}
module.exports = copyright;
