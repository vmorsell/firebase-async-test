import { describe, it } from 'mocha';
import { expect } from 'chai';
import { filenameFromPath } from './index';

describe('filenameFromPath', () => {
  it('should handle paths without slashes', () => {
    const res = filenameFromPath('x');
    expect(res).equal('x');
  });

  it('should handle paths with one slash', () => {
    const res = filenameFromPath('x/y');
    expect(res).equal('y');
  });

  it('should handle paths with multiple slashes', () => {
    const res = filenameFromPath('x/y/z');
    expect(res).equal('z');
  });
});
