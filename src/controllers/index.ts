import express, { Router } from 'express';
import {
	apexproCreateOrder,
	apexproGetAccount,
	apexproBuildOrderParams,
	apexproExportOrder,
	validateAlert,
	checkAfterPosition,
} from '../services';

const router: Router = express.Router();

router.get('/', async (req, res) => {
	console.log('Recieved GET request.');

	const apexproAccount = await apexproGetAccount();

	if (!apexproAccount ) {
		res.send('Error on getting account data');
	} else {
		const message =
			'apexpro Account Ready: ' +
			apexproAccount ;
		res.send(message);
	}
});

router.post('/', async (req, res) => {
	console.log('Recieved Tradingview strategy alert:', req.body);

	const validated = await validateAlert(req.body);
	if (!validated) {
		res.send('Error. alert message is not valid');
		return;
	}

	// if (!orderParams) return;
	let orderResult;
	switch (req.body['exchange']) {
		case 'perpetual': {

			break;
		}
		default: {
			const orderParams = await apexproBuildOrderParams(req.body);
			if (!orderParams) return;
			orderResult = await apexproCreateOrder(orderParams);
			if (!orderResult) return;
			await apexproExportOrder(
				req.body['strategy'],
				orderResult,
				req.body['price']
			);
		}
	}

	// checkAfterPosition(req.body);

	res.send('OK');
});

router.get('/debug-sentry', function mainHandler(req, res) {
	throw new Error('My first Sentry error!');
});

export default router;
