import type { EsploraUTXO, EsploraTransaction, EsploraFeeEstimates } from '@/src/types/blockchain.types'

// Re-using mockAddress here for consistency, assuming it might be defined elsewhere or passed in tests.
// For true standalone mock data, you might hardcode addresses or make them parameters.
const MOCK_ADDRESS_FOR_ESPLORA_DATA = 'mockaddress123' // Or import from a central constants mock file

export const mockEsploraUtxo: EsploraUTXO = {
  txid   : 'txid1_from_esplora_data_mock',
  vout   : 0,
  status : { confirmed: true, block_height: 123, block_hash: 'hash1', block_time: 1600000000 },
  value  : 100000,
}

export const mockEsploraTransaction: EsploraTransaction = {
  txid     : 'txid2_from_esplora_data_mock',
  version  : 1,
  locktime : 0,
  vin      : [ { 
    txid    : 'prev_txid_esplora_data_mock', 
    vout    : 0, 
    prevout : { 
        scriptpubkey         : 'prev_scriptpubkey_esplora_data_mock', 
        scriptpubkey_asm     : 'prev_asm_esplora_data_mock', 
        scriptpubkey_type    : 'prev_type_esplora_data_mock', 
        scriptpubkey_address : 'prev_address_esplora_data_mock', 
        value                : 200000 
    }, 
    scriptsig     : 'scriptsig_esplora_data_mock', 
    scriptsig_asm : 'scriptsig_asm_esplora_data_mock', 
    witness       : [], 
    is_coinbase   : false, 
    sequence      : 4294967295 
  } ],
  vout : [ { 
    scriptpubkey         : 'spk_esplora_data_mock', 
    scriptpubkey_asm     : 'asm_esplora_data_mock', 
    scriptpubkey_type    : 'type_esplora_data_mock', 
    value                : 90000, 
    scriptpubkey_address : MOCK_ADDRESS_FOR_ESPLORA_DATA 
  } ],
  size   : 200,
  weight : 800,
  fee    : 10000,
  status : { confirmed: true, block_height: 124, block_hash: 'hash2', block_time: 1600000100 },
}

export const mockFeeEstimatesRaw: EsploraFeeEstimates = {
  '1'   : 20.5,
  '6'   : 10.2,
  '144' : 2.1,
} 