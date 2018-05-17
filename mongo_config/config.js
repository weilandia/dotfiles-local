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
