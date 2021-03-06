'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.default = function (lowlight, defaultStyle) {
  return function SyntaxHighlighter(_ref5) {
    var language = _ref5.language,
        children = _ref5.children,
        _ref5$style = _ref5.style,
        style = _ref5$style === undefined ? defaultStyle : _ref5$style,
        _ref5$customStyle = _ref5.customStyle,
        customStyle = _ref5$customStyle === undefined ? {} : _ref5$customStyle,
        _ref5$codeTagProps = _ref5.codeTagProps,
        codeTagProps = _ref5$codeTagProps === undefined ? {} : _ref5$codeTagProps,
        _ref5$useInlineStyles = _ref5.useInlineStyles,
        useInlineStyles = _ref5$useInlineStyles === undefined ? true : _ref5$useInlineStyles,
        _ref5$showLineNumbers = _ref5.showLineNumbers,
        showLineNumbers = _ref5$showLineNumbers === undefined ? false : _ref5$showLineNumbers,
        _ref5$startingLineNum = _ref5.startingLineNumber,
        startingLineNumber = _ref5$startingLineNum === undefined ? 1 : _ref5$startingLineNum,
        lineNumberContainerStyle = _ref5.lineNumberContainerStyle,
        lineNumberStyle = _ref5.lineNumberStyle,
        wrapLines = _ref5.wrapLines,
        _ref5$lineStyle = _ref5.lineStyle,
        lineStyle = _ref5$lineStyle === undefined ? {} : _ref5$lineStyle,
        renderer = _ref5.renderer,
        _ref5$PreTag = _ref5.PreTag,
        PreTag = _ref5$PreTag === undefined ? 'pre' : _ref5$PreTag,
        _ref5$CodeTag = _ref5.CodeTag,
        CodeTag = _ref5$CodeTag === undefined ? 'code' : _ref5$CodeTag,
        rest = (0, _objectWithoutProperties3.default)(_ref5, ['language', 'children', 'style', 'customStyle', 'codeTagProps', 'useInlineStyles', 'showLineNumbers', 'startingLineNumber', 'lineNumberContainerStyle', 'lineNumberStyle', 'wrapLines', 'lineStyle', 'renderer', 'PreTag', 'CodeTag']);

    /* 
     * some custom renderers rely on individual row elements so we need to turn wrapLines on 
     * if renderer is provided and wrapLines is undefined
    */
    wrapLines = renderer && wrapLines === undefined ? true : wrapLines;
    renderer = renderer || defaultRenderer;
    var codeTree = language && !!lowlight.getLanguage(language) ? lowlight.highlight(language, children) : lowlight.highlightAuto(children);
    if (codeTree.language === null) {
      codeTree.value = [{ type: 'text', value: children }];
    }
    var defaultPreStyle = style.hljs || { backgroundColor: '#fff' };
    var preProps = useInlineStyles ? (0, _assign2.default)({}, rest, { style: (0, _assign2.default)({}, defaultPreStyle, customStyle) }) : (0, _assign2.default)({}, rest, { className: 'hljs' });

    var tree = wrapLines ? wrapLinesInSpan(codeTree, lineStyle) : codeTree.value;
    var lineNumbers = showLineNumbers ? _react2.default.createElement(LineNumbers, {
      containerStyle: lineNumberContainerStyle,
      numberStyle: lineNumberStyle,
      startingLineNumber: startingLineNumber,
      codeString: children
    }) : null;
    return _react2.default.createElement(
      PreTag,
      preProps,
      lineNumbers,
      _react2.default.createElement(
        CodeTag,
        codeTagProps,
        renderer({ rows: tree, stylesheet: style, useInlineStyles: useInlineStyles })
      )
    );
  };
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createElement = require('./create-element');

var _createElement2 = _interopRequireDefault(_createElement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var newLineRegex = /\n/g;
function getNewLines(str) {
  return str.match(newLineRegex);
}

function getLineNumbers(_ref) {
  var lines = _ref.lines,
      startingLineNumber = _ref.startingLineNumber,
      style = _ref.style;

  return lines.map(function (_, i) {
    var number = i + startingLineNumber;
    return _react2.default.createElement(
      'span',
      {
        key: 'line-' + i,
        className: 'react-syntax-highlighter-line-number',
        style: typeof style === 'function' ? style(number) : style
      },
      number + '\n'
    );
  });
}

function LineNumbers(_ref2) {
  var codeString = _ref2.codeString,
      _ref2$containerStyle = _ref2.containerStyle,
      containerStyle = _ref2$containerStyle === undefined ? { float: 'left', paddingRight: '10px' } : _ref2$containerStyle,
      _ref2$numberStyle = _ref2.numberStyle,
      numberStyle = _ref2$numberStyle === undefined ? {} : _ref2$numberStyle,
      startingLineNumber = _ref2.startingLineNumber;

  return _react2.default.createElement(
    'code',
    { style: containerStyle },
    getLineNumbers({
      lines: codeString.replace(/\n$/, '').split('\n'),
      style: numberStyle,
      startingLineNumber: startingLineNumber
    })
  );
}

function createLineElement(_ref3) {
  var children = _ref3.children,
      lineNumber = _ref3.lineNumber,
      lineStyle = _ref3.lineStyle,
      _ref3$className = _ref3.className,
      className = _ref3$className === undefined ? [] : _ref3$className;

  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: className,
      style: typeof lineStyle === 'function' ? lineStyle(lineNumber) : lineStyle
    },
    children: children
  };
}

function flattenCodeTree(tree) {
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var newTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  for (var i = 0; i < tree.length; i++) {
    var node = tree[i];
    if (node.type === 'text') {
      newTree.push(createLineElement({
        children: [node],
        className: className
      }));
    } else if (node.children) {
      var classNames = className.concat(node.properties.className);
      newTree = newTree.concat(flattenCodeTree(node.children, classNames));
    }
  }
  return newTree;
}

function wrapLinesInSpan(codeTree, lineStyle) {
  var tree = flattenCodeTree(codeTree.value);
  var newTree = [];
  var lastLineBreakIndex = -1;
  var index = 0;

  var _loop = function _loop() {
    var node = tree[index];
    var value = node.children[0].value;
    var newLines = getNewLines(value);
    if (newLines) {
      var splitValue = value.split('\n');
      splitValue.forEach(function (text, i) {
        var lineNumber = newTree.length + 1;
        var newChild = { type: 'text', value: text + '\n' };
        if (i === 0) {
          var _children = tree.slice(lastLineBreakIndex + 1, index).concat(createLineElement({ children: [newChild], className: node.properties.className }));
          newTree.push(createLineElement({ children: _children, lineNumber: lineNumber, lineStyle: lineStyle }));
        } else if (i === splitValue.length - 1) {
          var stringChild = tree[index + 1] && tree[index + 1].children && tree[index + 1].children[0];
          if (stringChild) {
            var lastLineInPreviousSpan = { type: 'text', value: '' + text };
            var newElem = createLineElement({ children: [lastLineInPreviousSpan], className: node.properties.className });
            tree.splice(index + 1, 0, newElem);
          } else {
            newTree.push(createLineElement({ children: [newChild], lineNumber: lineNumber, lineStyle: lineStyle }));
          }
        } else {
          newTree.push(createLineElement({ children: [newChild], lineNumber: lineNumber, lineStyle: lineStyle }));
        }
      });
      lastLineBreakIndex = index;
    }
    index++;
  };

  while (index < tree.length) {
    _loop();
  }
  if (lastLineBreakIndex !== tree.length - 1) {
    var children = tree.slice(lastLineBreakIndex + 1, tree.length);
    if (children && children.length) {
      newTree.push(createLineElement({ children: children, lineNumber: newTree.length + 1, lineStyle: lineStyle }));
    }
  }
  return newTree;
}

function defaultRenderer(_ref4) {
  var rows = _ref4.rows,
      stylesheet = _ref4.stylesheet,
      useInlineStyles = _ref4.useInlineStyles;

  return rows.map(function (node, i) {
    return (0, _createElement2.default)({
      node: node,
      stylesheet: stylesheet,
      useInlineStyles: useInlineStyles,
      key: 'code-segement' + i
    });
  });
}