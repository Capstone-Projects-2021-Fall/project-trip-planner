


import { GetDateTimeOrNull } from '../common.js';
describe('checks that date 12/3/2021 is valid', () => {
  it('returns the date if it is a valid date. This test inputs a valid date so it should return a date', () => {
    expect(GetDateTimeOrNull('12/3/2021')).toStrictEqual(new Date('12/3/2021'));
    expect(GetDateTimeOrNull('13/3/2021')).toStrictEqual(null);
    expect(GetDateTimeOrNull('12/4/2021')).toStrictEqual(new Date('12/4/2021'));

  });
});

describe('checks that date 1/4/2021 is valid', () => {
  it('returns the date if it is a valid date. This test inputs a valid date so it should return a date', () => {

    expect(GetDateTimeOrNull('1/4/2021')).toStrictEqual(new Date('1/4/2021'));

  });
});

describe('checks that date 13/3/2021 is not valid', () => {
  it('returns the date if it is a valid date. This test inputs a valid date so it should return a date', () => {
    expect(GetDateTimeOrNull('13/3/2021')).toStrictEqual(null);

  });
});


import { IsNullOrWhitespace } from '../common.js';
describe('IsNullOrWhitespace', () => {
  it('returns false if valid, returns true if whitespace. Testing a string that is not white space, so should return false', () => {
    expect(IsNullOrWhitespace("not whitespace")).toBe(false);
  });
});

describe('IsNullOrWhitespace', () => {
  it('returns false if valid, returns true if whitespace. Testing a string that is white space, so should return true', () => {
    expect(IsNullOrWhitespace(" ")).toBe(true);
  });
});

describe('IsNullOrWhitespace', () => {
  it('returns false if valid, returns true if whitespace. Testing a string that is a tab (white space), so should return true', () => {
    expect(IsNullOrWhitespace("        ")).toBe(true);
  });
});

import {GetDateOrNull} from '../common.js';
describe('GetDateOrNull', () => {
  it('returns the date if it is a valid date', () => {
      expect(GetDateTimeOrNull('12/4/2021')).toStrictEqual(new Date('12/4/2021'));
  });
});

import { GetValidStringOrNull } from '../common.js';
describe('GetValidStringOrNull', () => {
  it('returns the string if valid, returns null if whitespace. Testing a string that is not white space, so should return the string', () => {
    expect(GetValidStringOrNull("not whitespace again")).toBe("not whitespace again");
  });
});

describe('GetValidStringOrNull', () => {
  it('returns the string if valid, returns null if whitespace. Testing a string that is white space, so should return null', () => {
    expect(GetValidStringOrNull(" ")).toBe(null);
  });
});

describe('GetValidStringOrNull', () => {
  it('returns the string if valid, returns null if whitespace. Testing a string that is white space(tab), so should return null', () => {
    expect(GetValidStringOrNull("   ")).toBe(null);
  });
});

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import {fillItineraries} from '../common.js';
describe('fillItineraries', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/itinerarySearch.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that fillItineraries updated the text of the element based on the list given to it. In this case, it is given an empty list and the text should tell the user they have no itineraries', function () {

    fillItineraries(document.getElementById('itinerary-list-holder'), '', 200, true, true, true);
    expect(document.getElementById('itinerary-list-holder').innerHTML).toStrictEqual('<div class=\"itinerary-empty\">You have no itineraries. Create one!</div>');
    //fillItineraries(document.getElementById('itinerary-list-holder'), '', 200, true, false, false);
    //expect(document.getElementById('itinerary-list-holder').innerHTML).toStrictEqual('<div class=\"itinerary-empty\">You have no itineraries. Create one!</div><div class=\"itinerary-empty\">This user has no itineraries.</div>');

  });
});

describe('fillItineraries', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/itinerarySearch.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that fillItineraries updated the text of the element based on the list given to it. In this case, it is given an empty list and the text should tell the user they have no itineraries', function () {

    fillItineraries(document.getElementById('itinerary-list-holder'), '', 200, true, false, false);
    expect(document.getElementById('itinerary-list-holder').innerHTML).toStrictEqual('<div class=\"itinerary-empty\">This user has no itineraries.</div>');

  });
});
