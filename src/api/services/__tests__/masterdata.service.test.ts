import { describe, expect, it } from '@jest/globals';
import { normalizeMasterDataResponse } from '../masterdata.service';

describe('normalizeMasterDataResponse', () => {
  it('parses array payloads into selectable options', () => {
    const result = normalizeMasterDataResponse([
      { id: 1, name: 'Female' },
      { label: 'Male' },
      'Non-binary',
    ]);

    expect(result).toEqual([
      { id: '1', label: 'Female', value: 'Female' },
      { id: 'Male', label: 'Male', value: 'Male' },
      { id: 'Non-binary', label: 'Non-binary', value: 'Non-binary' },
    ]);
  });

  it('unwraps wrapped data envelopes', () => {
    const result = normalizeMasterDataResponse({
      data: [{ displayName: 'English' }, { name: 'Hindi' }],
    });

    expect(result).toEqual([
      { id: 'English', label: 'English', value: 'English' },
      { id: 'Hindi', label: 'Hindi', value: 'Hindi' },
    ]);
  });
});
