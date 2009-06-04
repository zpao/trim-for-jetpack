/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the tr.im Jetpack Feature.
 *
 * The Initial Developer of the Original Code is
 * Paul O’Shannessy <paul@oshannessy.com>
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


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

