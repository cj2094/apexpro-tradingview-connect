
import { PositionSide } from '@perp/sdk-curie';

export type AlertObject = {
	exchange: string;
	strategy: string;
	market: string;
	size: number;
	order: string;
	price: number;
	position: string;
	reverse: boolean;
	passphrase?: string;
};
