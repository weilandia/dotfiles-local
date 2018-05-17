prompt = function() {
  if (typeof db == 'undefined') {
    return '(nodb) > ';
  }

  return db + ' > ';
};
