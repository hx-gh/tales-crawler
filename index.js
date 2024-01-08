const fs = require('fs').promises;
const { Worker, isMainThread } = require('worker_threads');
const copyright = require('./src/utils/copyright');
var workersId = 0;
async function startApplication() {
	try {
		var list = await fs.readFile('./lista/itens.json');
		var parsedData = await JSON.parse(list);
		const setIntervalValue = (parsedData.itemsToBeSearched.length * 7500) / 2;
		await copyright(setIntervalValue);
		const FirstWorkerArray = parsedData.itemsToBeSearched.splice(
			0,
			parsedData.itemsToBeSearched.length / 2
		);
		const SecondWorkerArray = parsedData.itemsToBeSearched.splice(
			0,
			parsedData.itemsToBeSearched.length
		);
		return setInterval(async () => {
			return await new Promise(async (resolve, reject) => {
				var Counter = 0;
				CallWorkerThread(FirstWorkerArray, Counter, 'Primeiro ');
				CallWorkerThread(SecondWorkerArray, Counter, 'Segundo ');
				if (Counter === 2) {
					resolve();
				}
			});
		}, setIntervalValue);
	} catch (error) {
		console.log(error);
	}
}

async function CallWorkerThread(array, counter, identifier) {
	const worker = new Worker('./src/services/checkItemPrice.js');
	worker.on('error', (error) => {
		console.log(error.message);
		return reject();
	});
	worker.postMessage(array);
	worker.once('message', async (message) => {
		console.log(`${identifier}worker finalizando. ID: ${workersId}`);
		workersId++;
		return counter++;
	});
}

startApplication();
