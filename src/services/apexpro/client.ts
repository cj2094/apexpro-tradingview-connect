import config = require('config');
import 'dotenv/config';
import {ApexClient, ApiKeyCredentials} from "apexpro-connector-node";
import {SymbolObject} from "apexpro-connector-node/lib/apexpro";
import {PerpetualContractObject} from "apexpro-connector-node/lib/apexpro/interface/public";

class ApexproConnector {
	client: ApexClient | undefined;
	positionID = '0';
	static instance: ApexproConnector | null = null;
	symbols: SymbolObject | undefined;

	public constructor() {
		if (
			!process.env.API_KEY ||
			!process.env.API_PASSPHRASE ||
			!process.env.API_PASSPHRASE
		) {
			console.log('API Key for Apexpro is not set as environment variable');
			return;
		}
		if (!process.env.STARK_PUBLIC_KEY || !process.env.STARK_PRIVATE_KEY) {
			console.log('STARK Key for Apexpro is not set as environment variable');
			return;
		}
		if (!process.env.ACCOUNT_ID) {
			console.log('account id  for Apexpro is not set as environment variable');
			return;
		}


		this.client = new ApexClient();

	}

	static async build() {
		if (!this.instance) {
			const connector = new ApexproConnector();
			if (!connector || !connector.client) return;
			//const account = await connector.client.private.getAccount(
			//	process.env.ETH_ADDRESS
			//);

			const apiKeys: ApiKeyCredentials = {
				key: process.env.API_KEY,
				passphrase: process.env.API_PASSPHRASE,
				secret: process.env.API_SECRET
			};

			await connector.client.init(apiKeys, process.env.STARK_PRIVATE_KEY, process.env.ACCOUNT_ID);

			connector.symbols = await connector.client.publicApi.symbols();

			connector.positionID = process.env.ACCOUNT_ID;
			this.instance = connector;
		}

		return this.instance;
	}

	GetSymbolData = async function(symbol:string) : Promise<PerpetualContractObject> {
		const connector = await ApexproConnector.build();
		if (!connector ) return;
		if( connector.symbols != null ){
			for(const key  of connector.symbols.perpetualContract){
				if (key.symbol == symbol || key.crossSymbolName == symbol || key.symbolDisplayName == symbol )
					return key
			}
		}
	};
}

export default ApexproConnector;
