var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import PropTypes from 'prop-types';

var styles = {
  ellipsis: {
    position: 'fixed',
    visibility: 'hidden',
    top: 0,
    left: 0
  }
};

function getEllipsisWidth(node) {
  return node.offsetWidth;
}

function trimRight(text) {
  return text.replace(/\s+$/, '');
}

function renderLine(line, i, arr) {
  if (i === arr.length - 1) {
    return React.createElement(
      'span',
      { key: i },
      line
    );
  } else {
    var br = React.createElement('br', { key: i + 'br' });

    if (line) {
      return [React.createElement(
        'span',
        { key: i },
        line
      ), br];
    } else {
      return br;
    }
  }
}

// Shim innerText to consistently break lines at <br/> but not at \n
function getInnerText(node) {
  var div = document.createElement('div');
  var contentKey = 'innerText' in window.HTMLElement.prototype ? 'innerText' : 'textContent';

  // NOTE: hackfix
  div.innerHTML = node.innerHTML.replace(/\r\n|\r|\n/g, '<br/>');

  var text = div[contentKey];

  var test = document.createElement('div');
  test.innerHTML = 'foo<br/>bar';

  if (test[contentKey].replace(/\r\n|\r/g, '\n') !== 'foo\nbar') {
    div.innerHTML = div.innerHTML.replace(/<br.*?[\/]?>/gi, '\n');
    text = div[contentKey];
  }

  return text;
}

var Truncate = function (_Component) {
  _inherits(Truncate, _Component);

  function Truncate() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Truncate);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Truncate.__proto__ || Object.getPrototypeOf(Truncate)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.elements = {}, _this.onResize = function () {
      _this.calcTargetWidth();
    }, _this.onTruncate = function (didTruncate) {
      var onTruncate = _this.props.onTruncate;


      if (typeof onTruncate === 'function') {
        _this.timeout = window.requestAnimationFrame(function () {
          onTruncate(didTruncate);
        });
      }
    }, _this.calcTargetWidth = function (callback) {
      var _this2 = _this,
          target = _this2.elements.target,
          calcTargetWidth = _this2.calcTargetWidth,
          canvasContext = _this2.canvasContext,
          width = _this2.props.width;

      // Calculation is no longer relevant, since node has been removed

      if (!target) {
        return;
      }

      var targetWidth = width ||
      // Floor the result to deal with browser subpixel precision
      Math.floor(target.parentNode.getBoundingClientRect().width);

      // Delay calculation until parent node is inserted to the document
      // Mounting order in React is ChildComponent, ParentComponent
      if (!targetWidth) {
        return window.requestAnimationFrame(function () {
          return calcTargetWidth(callback);
        });
      }

      var style = window.getComputedStyle(target);

      var font = [style['font-weight'], style['font-style'], style['font-size'], style['font-family']].join(' ');

      canvasContext.font = font;

      _this.setState({
        targetWidth: targetWidth
      }, callback);
    }, _this.measureWidth = function (text) {
      return _this.canvasContext.measureText(text).width;
    }, _this.getLines = function () {
      var _this3 = _this,
          elements = _this3.elements,
          _this3$props = _this3.props,
          numLines = _this3$props.lines,
          ellipsis = _this3$props.ellipsis,
          trimWhitespace = _this3$props.trimWhitespace,
          targetWidth = _this3.state.targetWidth,
          measureWidth = _this3.measureWidth,
          onTruncate = _this3.onTruncate;


      var lines = [];
      var text = getInnerText(elements.text);
      var textLines = text.split('\n').map(function (line) {
        return line.split(' ');
      });
      var didTruncate = true;
      var ellipsisWidth = getEllipsisWidth(_this.elements.ellipsis);

      for (var line = 1; line <= numLines; line++) {
        var textWords = textLines[0];

        // Handle newline
        if (textWords.length === 0) {
          lines.push();
          textLines.shift();
          line--;
          continue;
        }

        var resultLine = textWords.join(' ');

        if (measureWidth(resultLine) <= targetWidth) {
          if (textLines.length === 1) {
            // Line is end of text and fits without truncating
            didTruncate = false;

            lines.push(resultLine);
            break;
          }
        }

        if (line === numLines) {
          // Binary search determining the longest possible line inluding truncate string
          var textRest = textWords.join(' ');

          var lower = 0;
          var upper = textRest.length - 1;

          while (lower <= upper) {
            var middle = Math.floor((lower + upper) / 2);

            var testLine = textRest.slice(0, middle + 1);

            if (measureWidth(testLine) + ellipsisWidth <= targetWidth) {
              lower = middle + 1;
            } else {
              upper = middle - 1;
            }
          }

          var lastLineText = textRest.slice(0, lower);

          if (trimWhitespace) {
            lastLineText = trimRight(lastLineText);

            // Remove blank lines from the end of text
            while (!lastLineText.length && lines.length) {
              var prevLine = lines.pop();

              lastLineText = trimRight(prevLine);
            }
          }

          resultLine = React.createElement(
            'span',
            null,
            lastLineText,
            ellipsis
          );
        } else {
          // Binary search determining when the line breaks
          var _lower = 0;
          var _upper = textWords.length - 1;

          while (_lower <= _upper) {
            var _middle = Math.floor((_lower + _upper) / 2);

            var _testLine = textWords.slice(0, _middle + 1).join(' ');

            if (measureWidth(_testLine) <= targetWidth) {
              _lower = _middle + 1;
            } else {
              _upper = _middle - 1;
            }
          }

          // The first word of this line is too long to fit it
          if (_lower === 0) {
            // Jump to processing of last line
            line = numLines - 1;
            continue;
          }

          resultLine = textWords.slice(0, _lower).join(' ');
          textLines[0].splice(0, _lower);
        }

        lines.push(resultLine);
      }

      onTruncate(didTruncate);

      return lines;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Truncate, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var text = this.elements.text,
          calcTargetWidth = this.calcTargetWidth,
          onResize = this.onResize;


      var canvas = document.createElement('canvas');
      this.canvasContext = canvas.getContext('2d');

      calcTargetWidth(function () {
        // Node not needed in document tree to read its content
        if (text) {
          text.parentNode.removeChild(text);
        }
      });

      window.addEventListener('resize', onResize);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      // Render was based on outdated refs and needs to be rerun
      if (this.props.children !== prevProps.children) {
        this.forceUpdate();
      }

      // If the width prop has changed, recalculate size of contents
      if (this.props.width !== prevProps.width) {
        this.calcTargetWidth();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var ellipsis = this.elements.ellipsis,
          onResize = this.onResize,
          timeout = this.timeout;


      ellipsis.parentNode.removeChild(ellipsis);

      window.removeEventListener('resize', onResize);

      window.cancelAnimationFrame(timeout);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var target = this.elements.target,
          _props = this.props,
          children = _props.children,
          ellipsis = _props.ellipsis,
          lines = _props.lines,
          spanProps = _objectWithoutProperties(_props, ['children', 'ellipsis', 'lines']),
          targetWidth = this.state.targetWidth,
          getLines = this.getLines,
          onTruncate = this.onTruncate;

      var text = void 0;

      var mounted = !!(target && targetWidth);

      if (typeof window !== 'undefined' && mounted) {
        if (lines > 0) {
          text = getLines().map(renderLine);
        } else {
          text = children;

          onTruncate(false);
        }
      }

      delete spanProps.onTruncate;
      delete spanProps.trimWhitespace;

      return React.createElement(
        'span',
        _extends({}, spanProps, {
          ref: function ref(targetEl) {
            _this4.elements.target = targetEl;
          }
        }),
        React.createElement(
          'span',
          null,
          text
        ),
        React.createElement(
          'span',
          {
            ref: function ref(textEl) {
              _this4.elements.text = textEl;
            }
          },
          children
        ),
        React.createElement(
          'span',
          {
            ref: function ref(ellipsisEl) {
              _this4.elements.ellipsis = ellipsisEl;
            },
            style: styles.ellipsis
          },
          ellipsis
        )
      );
    }
  }]);

  return Truncate;
}(Component);

Truncate.propTypes = {
  children: PropTypes.node,
  ellipsis: PropTypes.node,
  lines: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.number]),
  trimWhitespace: PropTypes.bool,
  width: PropTypes.number,
  onTruncate: PropTypes.func
};
Truncate.defaultProps = {
  children: '',
  ellipsis: '…',
  lines: 1,
  trimWhitespace: false,
  width: 0
};
export default Truncate;
