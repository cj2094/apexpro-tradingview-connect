import ApexproConnector from './client';
import config = require('config');
import { AlertObject } from '../../types';
import 'dotenv/config';
import { getDecimalPointLength, getStrategiesDB } from '../../helper';
import {CreateOrderOptionsObject, generateRandomClientId, OrderType} from "apexpro-connector-node";
import {Market} from "apexpro-connector-node/lib/apexpro/interface";
import { BigNumber } from 'bignumber.js';

export const apexproBuildOrderParams = async (alertMessage: AlertObject) => {
	const [db, rootData] = getStrategiesDB();

	// set expiration datetime. must be more than 1 minute from current datetime
	const date = new Date();
	date.setMinutes(date.getMinutes() + 2);
	const dateStr = date.toJSON();

	const connector = await ApexproConnector.build();

	let market = alertMessage.market;
	if (market.endsWith("USD")) {
		market = market.replace("USD", "USDC");
	}

	const marketsData = await connector.GetSymbolData(market);

	if (!marketsData){
		console.log('markets is error, symbol=' + market);
		throw new Error('markets is error, symbol=' + market);
	}

	console.log('marketsData', marketsData);

	const tickerData = await connector.client.publicApi.tickers(marketsData.crossSymbolName);
	console.log('tickerData', tickerData);
	if (tickerData.length == 0) {
		console.error('tickerData is error');
		throw new Error('tickerData is error, symbol=' + marketsData.crossSymbolName);
	}


	const orderSide =
		alertMessage.order == 'buy' ? "BUY" : "SELL";

	let orderSize: number;
	if (
		alertMessage.reverse &&
		rootData[alertMessage.strategy].isFirstOrder == 'false'
	) {
		orderSize = alertMessage.size * 2;
	} else {
		orderSize = alertMessage.size;
	}

	const stepSize = parseFloat(marketsData.stepSize);
	const stepDecimal = getDecimalPointLength(stepSize);
	const orderSizeStr = Number(orderSize).toFixed(stepDecimal);



	const latestPrice = parseFloat(tickerData.at(0).oraclePrice);
	const tickSize = parseFloat(marketsData.tickSize);
	console.log('latestPrice', latestPrice);

	const slippagePercentage = 0.1;
	const minPrice =
		orderSide == "BUY"
			? latestPrice * (1 + slippagePercentage)
			: latestPrice * (1 - slippagePercentage);

	const priceBN = new BigNumber(minPrice);
	const price = priceBN.minus(priceBN.mod(tickSize)).toFixed();

	//const decimal = getDecimalPointLength(tickSize);
	//const price = minPrice.toFixed(decimal);

	const fee = parseFloat(config.get('Apexpro.User.limitFee')) * parseFloat(price) * parseFloat(orderSizeStr)
	console.log('fee: ', fee.toString());

	const currency_info: any = connector.symbols.currency.find((item) => item.id == marketsData.settleCurrencyId);

	const limitFee = BigNumber(fee).toFixed(currency_info.starkExResolution.length - 1, BigNumber.ROUND_UP)
	console.log('limitFee: ', limitFee.toString());
	const apiOrder: CreateOrderOptionsObject = {
		limitFee: limitFee.toString(),
		price: price,
		reduceOnly: false,
		side: orderSide,
		size: orderSizeStr,
		symbol: <Market>market,
		timeInForce: 'FILL_OR_KILL',
		type: OrderType.MARKET,
		clientOrderId: generateRandomClientId(),
		positionId: connector.positionID,
		trailingPercent: '',
		triggerPrice: '',
	} ;

	console.log('apiOrder for apexpro', apiOrder);
	return apiOrder;
};
