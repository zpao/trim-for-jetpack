// The clipboard isn't implemented in Jet Pack yet, so use the service.
const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
                         getService(Components.interfaces.nsIClipboardHelper);
///////////////////////////////////////////////////////////////////////////////

// global store to memoize trimed urls
var trimd = {};

function Trim(doc) {
  this._doc = $(doc);
  var _this = this;
  $(doc).click(function(){ _this.trimDoc(); });
  // check state every second to set the status bar color
  setInterval(function() {
    _this.setState();
  }, 1000);
}
Trim.prototype = {
  _doc: null,
  _trimUrl: null,
  _lastUrl: null,

  trimDoc: function() {
    if (!!trimd[jetpack.tabs.focused.url]) {
      this.copyToClipboard(trimd[jetpack.tabs.focused.url]);
    } else {
      this.trimUrl(jetpack.tabs.focused.url);
    }
  },
  setState: function() {
    if (!!trimd[jetpack.tabs.focused.url])
      this._doc.find("#trim").css("color", "green");
    else
      this._doc.find("#trim").css("color", "#666");
  },
  trimUrl: function(aUrl) {
    this._lastUrl = aUrl;
    var _this = this;
    $.get("http://api.tr.im/api/trim_url.json",
               { url: aUrl },
               function(data) {
      trimd[_this._lastUrl] = data.url;
      _this.setState();
      _this.copyToClipboard(data.url);
    }, "json");
  },
  copyToClipboard: function(aUrl) {
    // again, gClipboardHelper not the final API
    gClipboardHelper.copyString(aUrl);
    var msg = "Copied " + aUrl + " to your clipboard"
    jetpack.notifications.show({
      title: "tr.im",
      body: msg,
      icon: "http://tr.im/favicon.ico"
    });
  }
};

var theHTML = "<html><head><style>body{text-align: center} #trim{ color: #666; font-size: 20px; font-family: helvetica, arial, sans-serif; }</style></head><body><span id='trim'>tr.im</span></body></html>";

jetpack.statusBar.append({
  html: theHTML,
  width: 50,
  onReady: function(doc) {
    var trim = new Trim(doc);
  }
});

