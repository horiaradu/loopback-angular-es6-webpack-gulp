import { expect } from 'chai';

describe('Server', () => {
  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('promise resolves to true', () =>
    expect(Promise.resolve(true)).to.become(true)
  );
});
