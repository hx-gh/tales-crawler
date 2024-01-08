const puppeteer = require('puppeteer');
const sound = require('sound-play');
const path = require('path');
const chalk = require('chalk');
const filePath = path.join(__dirname, '../assets/audio/notification.mp3');
const { parentPort } = require('worker_threads');

parentPort.once('message', async (parsedData) => {
	try {
		const browser = await puppeteer.launch({ headless: 'new' });
		const page = await browser.newPage();
		await page.goto('https://ragnatales.com.br/market');
		// Aguarda o carregamento dos elementos necessários na página
		await new Promise((r) => setTimeout(r, 5000));
		for await (var itemProps of parsedData) {
			let PageResult = await HandlePagesChange(itemProps, page);
		}
		await browser.close();
		return parentPort.postMessage({
			status: true,
			message: 'Successfully finished working thread',
		});
	} catch (error) {
		console.log(error);
	}
});
async function HandlePagesChange(itemProps, page) {
	return new Promise(async (resolve, reject) => {
		try {
			const stringBase64 = btoa(itemProps.itemName);
			console.log(
				chalk.blue(
					`[SERVER] Buscando o item: ${itemProps.itemName} até o valor de: ${itemProps.itemPrice}`
				)
			);
			const url = `https://ragnatales.com.br/market?page=1&query=${stringBase64}`;
			await page.goto(url);
			await new Promise((r) => setTimeout(r, 5000));
			let RawData = await HandleTagsToBeSearched(page);
			let ParsedDataStatus = await HandleRawData(RawData);
			let ProcessingResult = await ValidatesArrayValues(
				ParsedDataStatus.ToBeReturned,
				itemProps
			);
			return resolve({
				status: true,
				message: 'Successfully finished Page Handling',
			});
		} catch (error) {
			return reject(error);
		}
	});
}
async function HandleTagsToBeSearched(page) {
	const toBeManipulated = await page.evaluateHandle(() => {
		return Array.from(document.querySelectorAll('tbody.bg-white > tr')).map(
			(item) => item.innerText
		);
	});
	const priceArray = await toBeManipulated.jsonValue();
	return priceArray;
}
async function HandleRawData(RawData) {
	try {
		let ToBeReturned = await RawData.map((resultItem) => {
			let ParsedString = resultItem.replace(/[\r\n\t]/g, ';');
			let ParsedStrings = ParsedString.split(';');
			let FilteredArray = ParsedStrings.filter((stringItem) => {
				return stringItem !== '';
			});
			if (FilteredArray.length > 6) {
				const itemName = FilteredArray[0].split(' (')[0];
				const value = FilteredArray.find(
					(element) => /^\d{1,3}(?:\.\d{3})*$/.test(element) && element !== '1'
				);
				const location = FilteredArray.find((element) =>
					element.includes('Localização')
				);
				return { itemName, quantity: 1, value, location };
			}
			if (FilteredArray.length <= 6) {
				return {
					itemName: FilteredArray[0],
					quantity: FilteredArray[1],
					value: FilteredArray[2],
					location: FilteredArray[5],
				};
			}
		});
		return {
			status: true,
			message: 'Successfully processed Raw Data',
			ToBeReturned,
		};
	} catch (error) {
		console.log(error);
		return {
			status: false,
			message: 'Error while processing raw data',
			error,
		};
	}
}
async function ValidatesArrayValues(ParsedData, itemProps) {
	try {
		var ItemsFoundCounter = 0;
		if (ParsedData.length === 0) {
			console.log(
				chalk.red(
					`==================================================\nHouve um erro ao procurar o item: ${itemProps.itemName}\n==================================================`
				)
			);

			return {
				status: true,
				message: 'Successfully validates array values',
			};
		}
		if (ParsedData[0].itemName !== 'Nenhum registro foi encontrado') {
			let Result = await ParsedData.map(async (itemObject, index) => {
				const price = itemObject.value.replaceAll('.', '');
				if (parseInt(price, 10) <= parseInt(itemProps.itemPrice, 10)) {
					//Para validar se a carta é Original ou não
					if (itemProps.isCard !== undefined) {
						if (
							itemProps.originalCard === true &&
							!itemObject.itemName.includes('Selada') &&
							!itemObject.itemName.includes('Selado')
						) {
							await ToggleNotification(itemObject, itemProps);
							return ItemsFoundCounter++;
						}
						if (itemProps.originalCard === false) {
							await ToggleNotification(itemObject, itemProps);
							return ItemsFoundCounter++;
						}
					}
					if (itemProps.isCard === undefined) {
						console.log(itemObject, ParsedData[index]);
						await ToggleNotification(itemObject, itemProps);
						return ItemsFoundCounter++;
					}
				}
			});
		}
		if (ItemsFoundCounter === 0) {
			console.log(
				chalk.red(
					`==================================================\n${itemProps.itemName} não foi encontrado abaixo do valor de ${itemProps.itemPrice}\n==================================================`
				)
			);
		}
		return {
			status: true,
			message: 'Successfully validates array values',
		};
	} catch (error) {
		console.log(error);
		return {
			status: false,
			message: 'Error while validating array values',
			error,
		};
	}
}
async function ToggleNotification(itemObject, itemProps) {
	console.log(
		chalk.green(
			`==================================================\n${itemObject.itemName} foi encontrado abaixo do valor de ${itemProps.itemPrice}\nValor de venda: ${itemObject.value}\nSe encontra na ${itemObject.location}\nQuantidade: ${itemObject.quantity}\n==================================================`
		)
	);
	return sound.play(filePath);
}
