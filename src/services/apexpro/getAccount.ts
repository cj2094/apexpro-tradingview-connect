import ApexproConnector from './client';
import 'dotenv/config';

export const apexproGetAccount = async () => {
	try {
		const connector = await ApexproConnector.build();
		if(!connector) return false;

		/*const account = await connector.client.privateApi.getAccount(
			process.env.ETH_ADDRESS, process.env.ACCOUNT_ID,
		);*/

		const balance = await connector.client.privateApi.accountBalance();

		console.log('apexpro balance: ', balance);
		/*if (account.wallets != null && account.wallets.length > 0) {
			console.log('apexpro account balance: ', Number(account.wallets[0].balance));
			if (Number(account.wallets[0].balance) == 0) {
				return false;
			} else {
				return true;
			}
		} */
		if (balance != null){
			if (Number(balance.availableBalance) == 0) {
				return false;
			} else {
				return true;
			}
		} else
			return false
	} catch (error) {
		console.error(error);
	}
};
