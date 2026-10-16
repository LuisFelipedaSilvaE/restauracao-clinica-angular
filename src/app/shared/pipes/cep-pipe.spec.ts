import { CepPipe } from './cep-pipe';

describe('CepPipe', () => {
  const pipe = new CepPipe();

  it('should format an eight-digit CEP', () => {
    expect(pipe.transform('01310100')).toBe('01310-100');
  });

  it('should preserve an already formatted CEP', () => {
    expect(pipe.transform('01310-100')).toBe('01310-100');
  });

  it('should preserve a value with an invalid number of digits', () => {
    expect(pipe.transform('0131010')).toBe('0131010');
  });

  it('should return an empty string for an empty value', () => {
    expect(pipe.transform('')).toBe('');
  });
});
