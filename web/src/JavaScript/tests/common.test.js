


import { GetDateTimeOrNull } from '../common.js';
describe('checks that date 12/3/2021 is valid', () => {
  it('returns false if valid', () => {
    expect(GetDateTimeOrNull('12/3/2021')).toStrictEqual(new Date('12/3/2021'));
  });
});


import { IsNullOrWhitespace } from '../common.js';
describe('IsNullOrWhitespace', () => {
  it('returns false if valid', () => {
    expect(IsNullOrWhitespace("not whitespace")).toBe(false);
  });
});



//whats the difference between unit test and acceptance test?
//how do I write an acceptance test?
//whats an integration test? How do I write that?

//acceptance test, check to see that it meets the requirements that were asked for
//am i able to create an itinerary eg
//acceptance test not automated
//gather list of requirements, in order for this requirement to be true,
//i should be able to do this and this, then write tests to show you can do that

//integration test, test a whole feature
//name it and say 'this test tests the can i enter a date, can i make an event, can i delete an event'

//
