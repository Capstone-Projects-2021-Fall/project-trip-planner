const GetDateTimeOrNull = require('../common');

test('checks that date 12/3/2021 is valid', () => {
  expect(GetDateTimeOrNull('12/3/2021')).toBe('12/3/2021');
});
//whats the difference between unit test and acceptance test?
//how do I write an acceptance test?
//whats an integration test? How do I write that?