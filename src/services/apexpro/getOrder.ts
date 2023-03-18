import ApexproConnector from './client';
import { _sleep } from '../../helper';

export const getOrder = async (order_id: string) => {
	let count = 0;
	const maxTries = 3;
	let filled;
	while (count <= maxTries && !filled) {
		try {
			const connector = await ApexproConnector.build();
			const orderResponse = await connector.client.privateApi.getOrder(order_id);
			console.log('orderResponse: ', orderResponse);
			count++;
			filled = orderResponse.status == 'FILLED';

			if (filled) {
				return orderResponse;
			}
		} catch (error) {
			count++;
			filled = false;
			if (count == maxTries) {
				console.error(error);
			}
			await _sleep(5000);
		}
	}
};
