const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe('OnLoad', function () {
  beforeEach(function() {
    return JSDOM.fromFile('web/src/homepage.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      });
  })
  it ('Checks that onload changes the location', function () {

    document.cookie="id=1";
    OnLoad(null);
    expect(document.location).toStrictEqual("account.html");

  });
});