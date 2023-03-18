import ApexproConnector from './client';
import { _sleep } from '../../helper';
import {CreateOrderOptionsObject, OrderResponseObject} from "apexpro-connector-node";

export const apexproCreateOrder = async (apiOrder: CreateOrderOptionsObject) => {
	let count = 0;
	const maxTries = 3;
	while (count <= maxTries) {
		try {
			const connector = await ApexproConnector.build();


			const orderResult =
				await connector.client.privateApi.createOrder(
					apiOrder.clientOrderId,
					apiOrder.positionId,
					apiOrder.symbol,
					apiOrder.side,
					apiOrder.type,
					apiOrder.size,
					apiOrder.price,
					apiOrder.limitFee,
					apiOrder.timeInForce,
					apiOrder.triggerPrice,
					apiOrder.trailingPercent,
					apiOrder.reduceOnly,
				);

			 //console.log("orderResult.order：" , orderResult);

			console.log(
				new Date() + ' placed order market:',
				apiOrder.symbol,
				'side:',
				apiOrder.side,
				'price:',
				apiOrder.price,
				'size:',
				apiOrder.size
			);

			return orderResult;
		} catch (error) {
			count++;
			if (count == maxTries) {
				console.error(error);
			}
			await _sleep(5000);
		}
	}
};
