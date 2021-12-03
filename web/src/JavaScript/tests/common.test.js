


import { GetDateTimeOrNull } from '../common.js';
describe('checks that date 12/3/2021 is valid', () => {
  it('returns the date if it is a valid date. This test inputs a valid date so it should return a date', () => {
    expect(GetDateTimeOrNull('12/3/2021')).toStrictEqual(new Date('12/3/2021'));
  });
});


import { IsNullOrWhitespace } from '../common.js';
describe('IsNullOrWhitespace', () => {
  it('returns false if valid, returns true if whitespace. Testing a string that is not white space, so should return false', () => {
    expect(IsNullOrWhitespace("not whitespace")).toBe(false);
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
    //expect(document.getElementById('navDemo')).toStrictEqual("something");
  });
});


//ANOTHER EXAMPLE
/**
var updateMsg = require('./module.js');
describe('updateMsg', function () {
  before(function() {
    return JSDOM.fromFile('index.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('updates the innerHTML of element with id "msg"', function () {
    expect(document.getElementById('msg').innerHTML).to.equal('Hello, World!');
    updateMsg('The new msg!');
    expect(document.getElementById('msg').innerHTML).to.equal('The new msg!');
  });
});
**/

//EXAMPLE
/**
jest.mock('../fetchCurrentUser');

test('displays a user after a click', () => {
  // Set up our document body
  document.body.innerHTML =
    '<div>' +
    '  <span id="username" />' +
    '  <button id="button" />' +
    '</div>';

  // This module has a side-effect
  require('../displayUser');

  const $ = require('jquery');
  const fetchCurrentUser = require('../fetchCurrentUser');

  // Tell the fetchCurrentUser mock function to automatically invoke
  // its callback with some data
  fetchCurrentUser.mockImplementation(cb => {
    cb({
      fullName: 'Johnny Cash',
      loggedIn: true,
    });
  });

  // Use jquery to emulate a click on our button
  $('#button').click();

  // Assert that the fetchCurrentUser function was called, and that the
  // #username span's inner text was updated as we'd expect it to.
  expect(fetchCurrentUser).toBeCalled();
  expect($('#username').text()).toEqual('Johnny Cash - Logged In');
});
**/


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
