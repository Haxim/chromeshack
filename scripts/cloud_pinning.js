// Generated by CoffeeScript 1.4.0
(function() {
  var PinList, Pinning,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };

  PinList = (function() {

    function PinList() {
      this._getUsername = __bind(this._getUsername, this);

      this.isIdPinned = __bind(this.isIdPinned, this);

      this.removePinnedPost = __bind(this.removePinnedPost, this);

      this.addPinnedPost = __bind(this.addPinnedPost, this);

      this.initializePinList = __bind(this.initializePinList, this);

    }

    PinList.prototype.initializePinList = function(success) {
      var username,
        _this = this;
      username = this._getUsername();
      if (username.length === 0) {
        return;
      }
      getUrl("https://shacknotify.bit-shift.com:12244/users/" + username + "/settings", function(res) {
        if (res.status === 200) {
          console.log("Got settings data: " + res.responseText);
          _this.pinnedList = JSON.parse(res.responseText)['watched'];
          return success();
        }
      });
    };

    PinList.prototype.addPinnedPost = function(id, success) {
      var username,
        _this = this;
      username = this._getUsername();
      if (username.length === 0) {
        return;
      }
      if (!this.pinnedList.contains(id)) {
        getUrl("https://shacknotify.bit-shift.com:12244/users/" + username + "/settings", function(res) {
          var settingsData;
          if (res.status === 200) {
            settingsData = JSON.parse(res.responseText);
            _this.pinnedList.push(parseInt(id));
            settingsData['watched'] = _this.pinnedList;
            return postUrl("https://shacknotify.bit-shift.com:12244/users/" + username + "/settings", JSON.stringify(settingsData), function(res) {
              if (res.status === 200) {
                if (success) {
                  return success();
                }
              }
            });
          }
        });
      }
    };

    PinList.prototype.removePinnedPost = function(id, success) {
      var username,
        _this = this;
      username = this._getUsername();
      if (username.length === 0) {
        return;
      }
      if (this.pinnedList.contains(id)) {
        getUrl("https://shacknotify.bit-shift.com:12244/users/" + username + "/settings", function(res) {
          var settingsData;
          if (res.status === 200) {
            settingsData = JSON.parse(res.responseText);
            _this.pinnedList.remove(parseInt(id));
            settingsData['watched'] = _this.pinnedList;
            return postUrl("https://shacknotify.bit-shift.com:12244/users/" + username + "/settings", JSON.stringify(settingsData), function(res) {
              if (res.status === 200) {
                if (success) {
                  return success();
                }
              }
            });
          }
        });
      }
    };

    PinList.prototype.isIdPinned = function(id) {
      if (!this.pinnedList) {
        return false;
      }
      return this.pinnedList.contains(id);
    };

    PinList.prototype._getUsername = function() {
      var masthead, username;
      if (!this.username) {
        masthead = document.getElementById("user");
        username = getDescendentByTagAndClassName(masthead, "li", "user");
        this.username = stripHtml(username.innerHTML);
      }
      if (!this.username) {
        return '';
      }
      return this.username;
    };

    return PinList;

  })();

  Pinning = (function() {

    Pinning.finishedLoadingPinList = false;

    Pinning.loadingPinnedDiv = null;

    function Pinning(pinOnReply) {
      this.pinOnReply = pinOnReply;
      this._createElement = __bind(this._createElement, this);

      this._buttonClicked = __bind(this._buttonClicked, this);

      this._loadPinnedThread = __bind(this._loadPinnedThread, this);

      this._listLoaded = __bind(this._listLoaded, this);

      this._findParentElementWithClassName = __bind(this._findParentElementWithClassName, this);

      this.addPostBoxHandlers = __bind(this.addPostBoxHandlers, this);

      this.addPinLinks = __bind(this.addPinLinks, this);

      this.initialize = __bind(this.initialize, this);

      return;
    }

    Pinning.prototype.initialize = function() {
      var commentBlock, firstChattyComment, loadingImg, s;
      this.pinText = "pin";
      this.unpinText = "unpin";
      commentBlock = getDescendentByTagAndClassName(document.getElementById('content'), 'div', 'threads');
      this.loadingPinnedDiv = document.createElement('div');
      s = document.createElement('span');
      s.innerText = 'Loading Pinned Posts';
      loadingImg = document.createElement('img');
      loadingImg.src = chrome.extension.getURL("../images/loading-pinned.gif");
      this.loadingPinnedDiv.appendChild(s);
      this.loadingPinnedDiv.appendChild(loadingImg);
      firstChattyComment = commentBlock.firstElementChild;
      commentBlock.insertBefore(this.loadingPinnedDiv, firstChattyComment);
      this.pinList = new PinList();
      this.pinList.initializePinList(this._listLoaded);
    };

    Pinning.prototype.addPinLinks = function(item, id, isRootPost) {
      var authorElement, newDiv, pinId;
      if (!isRootPost) {
        return;
      }
      pinId = "pin_" + id;
      if (document.getElementById(pinId)) {
        return;
      }
      authorElement = getDescendentByTagAndClassName(item, "span", "author");
      if (!authorElement) {
        return;
      }
      newDiv = this._createElement(pinId, id, this.finishedLoadingPinList);
      authorElement.appendChild(newDiv);
    };

    Pinning.prototype.addPostBoxHandlers = function() {
      var btn, id, postform, rootElement,
        _this = this;
      if (!this.pinOnReply) {
        return;
      }
      postform = document.getElementById("postform");
      if (postform) {
        rootElement = this._findParentElementWithClassName(postform, 'root');
        if (rootElement) {
          id = rootElement.id.replace('root_', '');
          if (!this.pinList.isIdPinned(id)) {
            console.log("Root post is not pinned and pinning on reply is enabled.");
            btn = document.getElementById("frm_submit");
            if (btn) {
              console.log("Installing listener for root post id " + id);
              btn.addEventListener('click', function(e) {
                _this.pinList.addPinnedPost(id, function() {
                  var button;
                  console.log("Successfully pinned post after replying. Removing listener.");
                  btn.removeEventListener('click', arguments.callee);
                  button = document.getElementById("pin_button_" + id);
                  if (button) {
                    button.innerHTML = _this.unpinText;
                  }
                });
              });
            }
          }
        }
      }
    };

    Pinning.prototype._findParentElementWithClassName = function(startingElement, className) {
      if (startingElement.parentNode) {
        if (startingElement.parentNode.classList.contains(className)) {
          return startingElement.parentNode;
        } else {
          return this._findParentElementWithClassName(startingElement.parentNode, className);
        }
      }
      return null;
    };

    Pinning.prototype._listLoaded = function() {
      var commentBlock, el, pinButton, pinnedDiv, pinnedItem, _i, _len, _ref;
      this.finishedLoadingPinList = true;
      pinnedDiv = document.createElement('div');
      pinnedDiv.classList.add('pinnedPosts');
      _ref = this.pinList.pinnedList;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pinnedItem = _ref[_i];
        pinButton = document.getElementById("pin_button_" + pinnedItem);
        if (pinButton) {
          pinButton.innerHTML = this.unpinText;
        }
        el = document.getElementById("root_" + pinnedItem);
        if (el) {
          el.parentNode.removeChild(el);
          pinnedDiv.appendChild(el);
        } else {
          this._loadPinnedThread(pinnedItem, pinnedDiv);
        }
      }
      commentBlock = getDescendentByTagAndClassName(document.getElementById('content'), 'div', 'threads');
      commentBlock.removeChild(this.loadingPinnedDiv);
      commentBlock.insertBefore(pinnedDiv, commentBlock.firstElementChild);
    };

    Pinning.prototype._loadPinnedThread = function(threadId, pinnedSection, firstComment) {
      var _this = this;
      return getUrl("http://www.shacknews.com/chatty?id=" + threadId, function(res) {
        var doc, p;
        doc = document.implementation.createHTMLDocument("example");
        doc.documentElement.innerHTML = res.responseText;
        p = doc.getElementById("root_" + threadId);
        pinnedSection.appendChild(p);
      });
    };

    Pinning.prototype._buttonClicked = function(elementId, postId) {
      var button,
        _this = this;
      button = document.getElementById(elementId);
      if (button) {
        if (button.innerHTML === this.pinText) {
          this.pinList.addPinnedPost(postId, function() {
            return button.innerHTML = _this.unpinText;
          });
        } else {
          this.pinList.removePinnedPost(postId, function() {
            return button.innerHTML = _this.pinText;
          });
        }
      }
    };

    Pinning.prototype._createElement = function(elementId, postId, pinsLoaded) {
      var button, div, span,
        _this = this;
      div = document.createElement("div");
      div.id = elementId;
      div.className = "pin";
      button = document.createElement("a");
      button.href = "#";
      button.id = "pin_button_" + postId;
      button.className = 'pin_button';
      button.innerHTML = pinsLoaded && this.pinList.isIdPinned(postId) ? this.unpinText : this.pinText;
      if (pinsLoaded) {
        console.log("Created button with id " + elementId + " after pins loaded.");
      }
      button.addEventListener("click", function(e) {
        _this._buttonClicked(button.id, postId);
        return e.preventDefault();
      });
      span = document.createElement("span");
      span.appendChild(document.createTextNode("["));
      span.appendChild(button);
      span.appendChild(document.createTextNode("]"));
      div.appendChild(span);
      return div;
    };

    return Pinning;

  })();

  settingsLoadedEvent.addHandler(function() {
    if (getSetting("enabled_scripts").contains("cloud_pinning")) {
      _this.p = new Pinning(getSetting("pin_on_reply"));
      _this.p.initialize();
      processPostEvent.addHandler(_this.p.addPinLinks);
      processPostBoxEvent.addHandler(_this.p.addPostBoxHandlers);
    }
  });

}).call(this);
