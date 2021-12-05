import regeneratorRuntime from "regenerator-runtime";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import { initMap } from '../itinerary.js';

describe('initMap', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/itinerary.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that when initmap is called it creates the map', function () {

    initMap();
    var modalContainer = document.getElementById('item-modal-map');
    expect(modalContainer).toStrictEqual("something");
    //expect(document.getElementById('item-start-end-container')).toStrictEqual("something");
  });
});