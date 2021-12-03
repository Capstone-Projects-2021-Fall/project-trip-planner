
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import {CallAPI} from '../login.js';
describe('CallAPI', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/login.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that fillItineraries updated the text of the element based on the list given to it. In this case, it is given an empty list and the text should tell the user they have no itineraries', function () {

    document.getElementById('email').value = "email";
    document.getElementById('password').value = "pass";
    CallAPI("fake", "fake");

    expect(document.document.location).toStrictEqual("account.html");
    //expect(document.getElementById('navDemo')).toStrictEqual("something");
  });
});