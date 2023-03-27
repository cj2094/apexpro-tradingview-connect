import { AlertObject } from '../types';
import ApexproConnector from './apexpro/client';
import { getStrategiesDB } from '../helper';

export const validateAlert = async (
	alertMessage: AlertObject
): Promise<boolean> => {
	// check correct alert JSON format
	if (!Object.keys(alertMessage).length) {
		console.error('Tradingview alert is not JSON format.');
		return false;
	}

	// check passphrase
	if (process.env.TRADINGVIEW_PASSPHRASE && !alertMessage.passphrase) {
		console.error('Passphrase is not set on alert message.');
		return false;
	}
	if (
		alertMessage.passphrase &&
		alertMessage.passphrase != process.env.TRADINGVIEW_PASSPHRASE
	) {
		console.error('Passphrase from tradingview alert does not match to config');
		return false;
	}

	// check exchange
	if (alertMessage.exchange) {
		const validExchanges = ['apexpro'];
		if (!validExchanges.includes(alertMessage.exchange)) {
			console.error('Exchange name must be apexpro');
			return false;
		}
	}

	// check strategy name
	if (!alertMessage.strategy) {
		console.error('Strategy field of tradingview alert must not be empty');
		return false;
	}

	// check orderSide
	if (alertMessage.order != 'buy' && alertMessage.order != 'sell') {
		console.error(
			'Side field of tradingview alert is not correct. Must be buy or sell'
		);
		return false;
	}

	//check position
	if (
		alertMessage.position != 'long' &&
		alertMessage.position != 'short' &&
		alertMessage.position != 'flat'
	) {
		console.error('Position field of tradingview alert is not correct.');
		return false;
	}

	//check reverse
	if (typeof alertMessage.reverse != 'boolean') {
		console.error(
			'Reverse field of tradingview alert is not correct. Must be true or false.'
		);
		return false;
	}

	// check market if exchange is Apexpro
	if (!alertMessage.exchange || alertMessage.exchange == 'apexpro') {
		const market = alertMessage.market;
		if (!market) {
			console.error('Market field of tradingview alert is not correct.');
			return false;
		}

		const connector = await ApexproConnector.build();

		const marketsData = await connector.GetSymbolData(market);
		// console.log('markets', markets);

		if (!marketsData) {
			console.error('marketsData field of tradingview alert is not correct.');
			return false;
		}
		const minOrderSize = parseFloat(marketsData.minOrderSize);

		// check order size is greater than mininum order size
		if (alertMessage.size < minOrderSize) {
			console.error(
				'Order size of this strategy must be greater than mininum order size:',
				minOrderSize
			);
			return false;
		}
	}

	const [db, rootData] = getStrategiesDB();
	console.log('strategyData', rootData[alertMessage.strategy]);

	const rootPath = '/' + alertMessage.strategy;

	if (!rootData[alertMessage.strategy]) {
		const reversePath = rootPath + '/reverse';
		db.push(reversePath, alertMessage.reverse);

		const isFirstOrderPath = rootPath + '/isFirstOrder';
		db.push(isFirstOrderPath, 'true');
	}

	if (
		alertMessage.position == 'flat' &&
		rootData[alertMessage.strategy].isFirstOrder == 'true'
	) {
		console.log(
			'this alert is first and close order, so does not create a new order.'
		);
		return false;
	}

	return true;
};
