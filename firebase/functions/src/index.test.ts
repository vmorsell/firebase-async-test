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

describe('fileExtFromURL', () => {
  const baseURL = 'http://test.com/a/b';

  const tests = [
    {
      it: 'should return empty string if no ext can be found',
      cases: [
        {
          url: `${baseURL}/file`,
          want: '',
        },
        {
          url: `${baseURL}/file/`,
          want: '',
        },
        {
          url: `${baseURL}/file#fragment`,
          want: '',
        },
        {
          url: `${baseURL}/file/#fragment`,
          want: '',
        },
        {
          url: `${baseURL}/file?a=b`,
          want: '',
        },
        { url: `${baseURL}/file/?a=b`, want: '' },
      ],
    },
    {
      it: 'should handle regular formed URL:s',
      cases: [
        {
          url: `${baseURL}/file.x`,
          want: 'x',
        },
      ],
    },
    {
      it: 'should handle URL:s with fragments',
      cases: [
        {
          url: `${baseURL}/file.x#fragment`,
          want: 'x',
        },
      ],
    },
    {
      it: 'should handle URL:s with query string',
      cases: [
        {
          url: `${baseURL}/file.x?a=b`,
          want: 'x',
        },
      ],
    },
  ];

  for (const t of tests) {
    describe(t.it, () => {
      for (const c of t.cases) {
        it(c.url, () => {
          const res = fileExtFromURL(c.url);
          expect(res).equal(c.want);
        });
      }
    });
  }
});
