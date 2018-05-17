mongo_shell_config = {
  index_paranoia: false,            // querytime explain
  indent:         2,                // number of spaces for indent
  sort_keys:      false,            // sort the keys in documents when displayed
  uuid_type:      'default',        // 'java', 'c#', 'python' or 'default'
  column_separator:  '→',           // separator used when printing padded/aligned columns
  value_separator:   '/',           // separator used when merging padded/aligned values

  // Shell Color Settings
  // Colors available: red, green, yellow, blue, magenta, cyan
  colors: {
    'key':       { color: 'gray' },
    'number':    { color: 'red' },
    'boolean':   { color: 'blue', bright: true },
    'null':      { color: 'red', bright: true },
    'undefined': { color: 'magenta', bright: true },
    'objectid':  { color: 'yellow', underline: true },
    'string':    { color: 'green' },
    'binData':   { color: 'green', bright: true },
    'function':  { color: 'magenta' },
    'date':      { color: 'blue' },
    'uuid':      { color: 'cyan' },
    'databaseNames':   { color: 'green', bright: true },
    'collectionNames': { color: 'blue',  bright: true }
  }
}
//----------------------------------------------------------------------------
// Color Functions
//----------------------------------------------------------------------------
__ansi = {
    csi: String.fromCharCode(0x1B) + '[',
    reset:      '0',
    text_prop:  'm',
    foreground: '3',
    bright:     '1',
    underline:  '4',

    colors: {
        black:   '0',
        red:     '1',
        green:   '2',
        yellow:  '3',
        blue:    '4',
        magenta: '5',
        cyan:    '6',
        gray:    '7',
    }
};

function controlCode( parameters ) {
    if ( parameters === undefined ) {
        parameters = "";
    }
    else if (typeof(parameters) == 'object' && (parameters instanceof Array)) {
        parameters = parameters.join(';');
    }

    return __ansi.csi + String(parameters) + String(__ansi.text_prop);
};

function applyColorCode( string, properties, nocolor ) {
    var applyColor = (null == nocolor) ? true : !nocolor;

    return applyColor ? controlCode(properties) + String(string) + controlCode() : String(string);
};

function colorize( string, color, nocolor ) {

    var params = [];
    var code = __ansi.foreground + __ansi.colors[color.color];

    params.push(code);

    if ( color.bright === true ) params.push(__ansi.bright);
    if ( color.underline === true ) params.push(__ansi.underline);

    return applyColorCode( string, params, nocolor );
};

function colorizeAll( strings, color, nocolor ) {
    return strings.map(function(string) {
        return colorize( string, color, nocolor );
    });
};
__indent = Array(mongo_shell_config.indent + 1).join(' ');

ObjectId.prototype.toString = function() {
  return this.str;
};

ObjectId.prototype.tojson = function(indent, nolint) {
  return tojson(this);
};

var dateToJson = Date.prototype.tojson;

Date.prototype.tojson = function(indent, nolint, nocolor) {
  var isoDateString = dateToJson.call(this);
  var dateString = isoDateString.substring(8, isoDateString.length - 1);

  var isodate = colorize(dateString, mongo_shell_config.colors.date, nocolor);
  return 'ISODate(' + isodate + ')';
};

Array.tojson = function(a, indent, nolint, nocolor) {
  var lineEnding = nolint ? " " : "\n";

  if (!indent)
    indent = "";

  if (nolint)
    indent = "";

  if (a.length === 0) {
    return "[ ]";
  }

  var s = "[" + lineEnding;
  indent += __indent;
  for (var i = 0; i < a.length; i++) {
    s += indent + tojson(a[i], indent, nolint, nocolor);
    if (i < a.length - 1) {
      s += "," + lineEnding;
    }
  }
  if (a.length === 0) {
    s += indent;
  }

  indent = indent.substring(__indent.length);
  s += lineEnding + indent + "]";
  return s;
};

function surround(name, inside) {
  return [name, '(', inside, ')'].join('');
}

Number.prototype.commify = function() {
  // http://stackoverflow.com/questions/2901102
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

NumberLong.prototype.tojson = function(indent, nolint, nocolor) {
  var color = mongo_shell_config.colors.number;
  var output = colorize('"' + this.toString().match(/-?\d+/)[0] + '"', color, nocolor);
  return surround('NumberLong', output);
};

NumberInt.prototype.tojson = function(indent, nolint, nocolor) {
  var color = mongo_shell_config.colors.number;
  var output = colorize('"' + this.toString().match(/-?\d+/)[0] + '"', color, nocolor);
  return surround('NumberInt', output);
};

BinData.prototype.tojson = function(indent, nolint, nocolor) {
  var uuidType = mongo_shell_config.uuid_type;
  var uuidColor = mongo_shell_config.colors.uuid;
  var binDataColor = mongo_shell_config.colors.binData;

  if (this.subtype() === 3) {
    var output = colorize('"' + uuidToString(this) + '"', uuidColor, nocolor) + ', '
    output += colorize('"' + uuidType + '"', uuidColor)
    return surround('UUID', output);
  } else if (this.subtype() === 4) {
    var output = colorize('"' + uuidToString(this, "default") + '"', uuidColor, nocolor)
    return surround('UUID', output);
  } else {
    var output = colorize(this.subtype(), {
      color: 'red'
    }) + ', '
    output += colorize('"' + this.base64() + '"', binDataColor, nocolor)
    return surround('BinData', output);
  }
};

DBQuery.prototype.shellPrint = function() {
  try {
    var start = new Date().getTime();
    var n = 0;
    while (this.hasNext() && n < DBQuery.shellBatchSize) {
      var s = this._prettyShell ? tojson(this.next()) : tojson(this.next(), "", true);
      print(s);
      n++;
    }

    var output = [];

    if (typeof _verboseShell !== 'undefined' && _verboseShell) {
      var time = new Date().getTime() - start;
      var slowms = getSlowms();
      var fetched = "Fetched " + n + " record(s) in ";
      if (time > slowms) {
        fetched += colorize(time + "ms", {
          color: "red",
          bright: true
        });
      } else {
        fetched += colorize(time + "ms", {
          color: "green",
          bright: true
        });
      }
      output.push(fetched);
    }

    var paranoia = mongo_shell_config.index_paranoia;

    if (typeof paranoia !== 'undefined' && paranoia) {
      var explain = this.clone();
      explain._ensureSpecial();
      explain._query.$explain = true;
      explain._limit = Math.abs(n) * -1;
      var result = explain.next();

      if (current_version < 3) {
        var type = result.cursor;

        if (type !== undefined) {
          var index_use = "Index[";
          if (type == "BasicCursor") {
            index_use += colorize("none", {
              color: "red",
              bright: true
            });
          } else {
            index_use += colorize(result.cursor.substring(12), {
              color: "green",
              bright: true
            });
          }
          index_use += "]";
          output.push(index_use);
        }
      } else {
        var winningPlan = result.queryPlanner.winningPlan;
        var winningInputStage = winningPlan.inputStage.inputStage;

        if (winningPlan !== undefined) {
          var index_use = "Index[";
          if (winningPlan.inputStage.stage === "COLLSCAN" || (winningInputStage !== undefined && winningInputStage.stage !== "IXSCAN")) {
            index_use += colorize("none", {
              color: "red",
              bright: true
            });
          } else {
            var fullScan = false;
            for (index in winningInputStage.keyPattern) {
              if (winningInputStage.indexBounds[index][0] == "[MinKey, MaxKey]") {
                fullScan = true;
              }
            }

            if (fullScan) {
              index_use += colorize(winningInputStage.indexName + " (full scan)", {
                color: "yellow",
                bright: true
              });
            } else {
              index_use += colorize(winningInputStage.indexName, {
                color: "green",
                bright: true
              });
            }
          }
          index_use += "]";
          output.push(index_use);
        }
      }
    }

    if (this.hasNext()) {
      ___it___ = this;

      output.push('Type ' + colorize('it', { color: 'yellow', underline: true }) + ' for more');
    }
    print(output.join(" -- "));
  } catch (e) {
    print(e);
  }
};

function isInArray(array, value) {
  return array.indexOf(value) > -1;
}

tojsonObject = function(x, indent, nolint, nocolor, sort_keys) {
  var lineEnding = nolint ? " " : "\n";
  var tabSpace = nolint ? "" : __indent;
  var sortKeys = (null == sort_keys) ? mongo_shell_config.sort_keys : sort_keys;

  assert.eq((typeof x), "object", "tojsonObject needs object, not [" + (typeof x) + "]");

  if (!indent)
    indent = "";

  if (typeof(x.tojson) == "function" && x.tojson != tojson) {
    return x.tojson(indent, nolint, nocolor);
  }

  if (x.constructor && typeof(x.constructor.tojson) == "function" && x.constructor.tojson != tojson) {
    return x.constructor.tojson(x, indent, nolint, nocolor);
  }

  if (x.toString() == "[object MaxKey]")
    return "{ $maxKey : 1 }";
  if (x.toString() == "[object MinKey]")
    return "{ $minKey : 1 }";

  var s = "{" + lineEnding;

  // push one level of indent
  indent += tabSpace;

  var total = 0;
  for (var k in x) total++;
  if (total === 0) {
    s += indent + lineEnding;
  }

  var keys = x;
  if (typeof(x._simpleKeys) == "function")
    keys = x._simpleKeys();
  var num = 1;

  var keylist = [];

  for (var key in keys)
    keylist.push(key);

  if (sortKeys) {
    // Disable sorting if this object looks like an index spec
    if ((isInArray(keylist, "v") && isInArray(keylist, "key") && isInArray(keylist, "name") && isInArray(keylist, "ns"))) {
      sortKeys = false;
    } else {
      keylist.sort();
    }
  }

  for (var i = 0; i < keylist.length; i++) {
    var key = keylist[i];

    var val = x[key];
    if (val == DB.prototype || val == DBCollection.prototype)
      continue;

    var color = mongo_shell_config.colors.key;
    s += indent + colorize("\"" + key + "\"", color, nocolor) + ": " + tojson(val, indent, nolint, nocolor, sortKeys);
    if (num != total) {
      s += ",";
      num++;
    }
    s += lineEnding;
  }

  // pop one level of indent
  indent = indent.substring(__indent.length);
  return s + indent + "}";
};

tojson = function(x, indent, nolint, nocolor, sort_keys) {

  var sortKeys = (null == sort_keys) ? mongo_shell_config.sort_keys : sort_keys;

  if (x === null)
    return colorize("null", mongo_shell_config.colors['null'], nocolor);

  if (x === undefined)
    return colorize("undefined", mongo_shell_config.colors['undefined'], nocolor);

  if (x.isObjectId) {
    var color = mongo_shell_config.colors['objectid'];
    return surround('ObjectId', colorize('"' + x.str + '"', color, nocolor));
  }

  if (!indent)
    indent = "";

  var s;
  switch (typeof x) {
    case "string":
      {
        s = "\"";
        for (var i = 0; i < x.length; i++) {
          switch (x[i]) {
            case '"':
              s += '\\"';
              break;
            case '\\':
              s += '\\\\';
              break;
            case '\b':
              s += '\\b';
              break;
            case '\f':
              s += '\\f';
              break;
            case '\n':
              s += '\\n';
              break;
            case '\r':
              s += '\\r';
              break;
            case '\t':
              s += '\\t';
              break;

            default:
              {
                var code = x.charCodeAt(i);
                if (code < 0x20) {
                  s += (code < 0x10 ? '\\u000' : '\\u00') + code.toString(16);
                } else {
                  s += x[i];
                }
              }
          }
        }
        s += "\"";
        return colorize(s, mongo_shell_config.colors.string, nocolor);
      }
    case "number":
      return colorize(x, mongo_shell_config.colors.number, nocolor);
    case "boolean":
      return colorize("" + x, mongo_shell_config.colors['boolean'], nocolor);
    case "object":
      {
        s = tojsonObject(x, indent, nolint, nocolor, sortKeys);
        if ((nolint === null || nolint === true) && s.length < 80 && (indent === null || indent.length === 0)) {
          s = s.replace(/[\s\r\n ]+/gm, " ");
        }
        return s;
      }
    case "function":
      return colorize(x.toString(), mongo_shell_config.colors['function'], nocolor);
    default:
      throw "tojson can't handle type " + (typeof x);
  }

};


DBQuery.prototype._validate = function(o) {
  var firstKey = null;
  for (var k in o) {
    firstKey = k;
    break;
  }

  if (firstKey !== null && firstKey[0] == '$') {
    // for mods we only validate partially, for example keys may have dots
    this._validateObject(o);
  } else {
    // we're basically inserting a brand new object, do full validation
    this._validateForStorage(o);
  }
};

DBQuery.prototype._validateObject = function(o) {
  if (typeof(o) != "object")
    throw "attempted to save a " + typeof(o) + " value.  document expected.";

  if (o._ensureSpecial && o._checkModify)
    throw "can't save a DBQuery object";
};

DBQuery.prototype._validateForStorage = function(o) {
  this._validateObject(o);
  for (var k in o) {
    if (k.indexOf(".") >= 0) {
      throw "can't have . in field names [" + k + "]";
    }

    if (k.indexOf("$") === 0 && !DBCollection._allowedFields[k]) {
      throw "field names cannot start with $ [" + k + "]";
    }

    if (o[k] !== null && typeof(o[k]) === "object") {
      this._validateForStorage(o[k]);
    }
  }
};

DBQuery.prototype._checkMulti = function() {
  if (this._limit > 0 || this._skip > 0) {
    var ids = this.clone().select({
      _id: 1
    }).map(function(o) {
      return o._id;
    });
    this._query['_id'] = {
      '$in': ids
    };
    return true;
  } else {
    return false;
  }
};

DBQuery.prototype._prettyShell = true

DBQuery.prototype.ugly = function() {
  this._prettyShell = false;
  return this;
}
function runMatch(cmd, args, regexp) {
  clearRawMongoProgramOutput();
  if (args) {
    run(cmd, args);
  } else {
    run(cmd);
  }
  var output = rawMongoProgramOutput();
  return output.match(regexp);
};

function getEnv(env_var) {
  var env_regex = new RegExp(' ' + env_var + '=(.*)');
  return runMatch('env', '', env_regex)[1];
};

function getVersion() {
  var regexp = /version: (\d).(\d).(\d)/;
  return runMatch('mongo', '--version', regexp).slice(1, 4);
};

function isMongos() {
  return db.isMaster().msg == 'isdbgrid';
};

function getSlowms() {
  if (!isMongos()) {
    return db.getProfilingStatus().slowms;
  } else {
    return 100;
  }
};

function maxLength(listOfNames) {
  return listOfNames.reduce(function(maxLength, name) {
    return (name.length > maxLength) ? name.length : maxLength;
  }, 0);
};

function printPaddedColumns() {
  var columnWidths = Array.prototype.map.call(
    arguments,
    function(column) {
      return maxLength(column);
    }
  );

  for (i = 0; i < arguments[0].length; i++) {
    row = "";
    for (j = 0; j < arguments.length; j++) {
      var separator = ""
      var val = arguments[j][i].toString();
      if (!val && j >= arguments.length - 1) {
        continue;
      }
      val = val.pad(columnWidths[j], (j == 0));
      if (j > 0) {
        separator = " " + ((j == 1) ?
          mongo_shell_config['column_separator'] :
          mongo_shell_config['value_separator']
        ) + " ";
      }
      row += separator + val;
    }
    print(row);
  }

  return null;
};
prompt = function() {
  if (typeof db == 'undefined') {
    return '(nodb) > ';
  }

  return db + ' > ';
};
//----------------------------------------------------------------------------
// Randomise API
//----------------------------------------------------------------------------

function randomWord(length, words, seed) {
  /* Return a random word(s).
      length: length of each word (default is 5 letters).
      words: number of words (default is 1 word).
      seed: a word to be planted randomly amongst the word(s), good for search. (optional)
  */
  words = typeof words !== 'undefined' ? words : 1;
  length = typeof length !== 'undefined' ? length : 5;
  var seedOn = typeof seed !== 'undefined';
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";
  var firstword = true;
  for (var j = 0; j < words; j++) {
    var word = "";
    for (var i = 0; i < length; i++) {
      word += possible.charAt(Random.randInt(possible.length));
    }
    /* Plant a seeded word */
    if (seedOn == true) {
      var randomBool = Random.rand() >= 0.8;
      if (randomBool == true) {
        if (firstword == true) {
          text = seed;
          firstword = false;
        } else {
          text += " " + seed;
        }
        seedOn = false;
      }
    }
    if (firstword == true) {
      text = word;
      firstword = false;
    } else {
      text += " " + word;
    }
  }
  return text;
};

function randomNumber(max) {
  /* Return a random number
      max: highest random number (default is 100).
  */
  max = typeof max !== 'undefined' ? max : 100;
  return Random.randInt(max);
};

function randomDate(start, end) {
  /* Return a random date between start and end values.
     start: Date(), default 2 years ago.
     end: Date(), default today.
  */
  end = typeof end !== 'undefined' ? end : new Date();
  if (typeof start === 'undefined') {
    start = new Date(end.getTime());
    start.setYear(start.getFullYear() - 2);
  }
  return new Date(start.getTime() + Random.randInt(end.getTime() - start.getTime()));
};
// Better show dbs
shellHelper.show = function() {
  var show = shellHelper.show;
  return function(what) {
    assert(typeof what == "string");

    if (what == "collections" || what == "tables") {
      var collectionNames = db.getCollectionNames();
      var collectionStats = collectionNames.map(function(name) {
        var stats = db.getCollection(name).stats();
        if (stats.ok) {
          var size = (stats.size / 1024 / 1024).toFixed(3);
          return (size + "MB");
        } else if (stats.code === 166) {
          return "VIEW";
        } else {
          return "ERR:" + stats.code;
        }
      });
      var collectionStorageSizes = collectionNames.map(function(name) {
        var stats = db.getCollection(name).stats();
        if (stats.ok) {
          var storageSize = (stats.storageSize / 1024 / 1024).toFixed(3);
          return (storageSize + "MB");
        }
        return "";
      });
      collectionNames = colorizeAll(collectionNames, mongo_shell_config['colors']['collectionNames']);
      printPaddedColumns(collectionNames, collectionStats, collectionStorageSizes);
      return "";
    }

    if (what == "dbs" || what == "databases") {
      var databases = db.getMongo().getDBs().databases.sort(function(a, b) {
        return a.name.localeCompare(b.name)
      });
      var databaseNames = databases.map(function(db) {
        return db.name;
      });
      var databaseSizes = databases.map(function(db) {
        var sizeInGigaBytes = (db.sizeOnDisk / 1024 / 1024 / 1024).toFixed(3);
        return (db.sizeOnDisk > 1) ? (sizeInGigaBytes + "GB") : "(empty)";
      });
      databaseNames = colorizeAll(databaseNames, mongo_shell_config['colors']['databaseNames']);
      printPaddedColumns(databaseNames, databaseSizes);
      return "";
    }

    return show(what);
  }
}();
