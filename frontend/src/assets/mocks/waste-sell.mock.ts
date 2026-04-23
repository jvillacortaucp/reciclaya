import { WasteSellPageState } from '../../app/features/waste-sell/domain/waste-sell.models';
import { EMPTY_WASTE_SELL_STATE } from '../../app/features/waste-sell/data/waste-sell.constants';

export const WASTE_SELL_MOCK_STATE: WasteSellPageState = {
  ...EMPTY_WASTE_SELL_STATE,
  formValue: {
    ...EMPTY_WASTE_SELL_STATE.formValue,
    specificResidue: 'Cascara de mango premium',
    shortDescription:
      'Residuo clasificado por lote con humedad controlada, ideal para valorizacion agroindustrial.',
    logistics: {
      ...EMPTY_WASTE_SELL_STATE.formValue.logistics,
      warehouseAddress: 'Parque Industrial Norte, Nave 4, Cali'
    }
  },
  aiSuggestionNote:
    'Consejo EcoValor: anuncios con mas de 3 fotos claras y descripcion de proceso quimico/fisico incrementan conversion.'
};
