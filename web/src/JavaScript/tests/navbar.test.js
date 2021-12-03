const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import {fillItineraries} from '../navbar.js';
describe('MenuToggle', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/itinerarySearch.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that the navbar size it toggled correctly. In this case the nav bar starts large and gets small. The size is based on the class it has', function () {

    MenuToggle();
    expect(document.getElementById('navDemo').class).toStrictEqual("show-small");
  });
});