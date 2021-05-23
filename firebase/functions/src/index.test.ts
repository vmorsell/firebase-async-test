import { describe, it } from 'mocha';
import { expect } from 'chai';
import { filenameFromPath, fileExtFromURL } from './index';

describe('filenameFromPath', () => {
  const tests = [
    {
      it: 'should handle paths without slashes',
      path: 'x',
      want: 'x',
    },
    {
      it: 'should handle paths with one slash',
      path: 'x/y',
      want: 'y',
    },
    {
      it: 'should handle paths with multiple slashes',
      path: 'x/y/z',
      want: 'z',
    },
  ];

  for (const t of tests) {
    it(t.it, () => {
      const res = filenameFromPath(t.path);
      expect(res).equal(t.want);
    });
  }
});
