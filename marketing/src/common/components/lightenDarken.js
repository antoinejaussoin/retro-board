const pad = (num, totalChars) => {
  let pad = '0';
  num = num + '';
  while (num.length < totalChars) {
    num = pad + num;
  }
  return num;
};

// Ratio is between 0 and 1
const changeColor = (color, ratio, darker) => {
  // Trim trailing/leading whitespace
  color = color.replace(/^\s*|\s*$/, '');

  // Expand three-digit hex
  color = color.replace(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i, '#$1$1$2$2$3$3');

  // Calculate ratio
  const difference = Math.round(ratio * 256) * (darker ? -1 : 1),
    // Determine if input is RGB(A)
    rgb = color.match(
      new RegExp(
        '^rgba?\\(\\s*' +
          '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
          '\\s*,\\s*' +
          '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
          '\\s*,\\s*' +
          '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
          '(?:\\s*,\\s*' +
          '(0|1|0?\\.\\d+))?' +
          '\\s*\\)$',
        'i'
      )
    ),
    alpha = !!rgb && rgb[4] != null ? rgb[4] : null,
    // Convert hex to decimal
    decimal = !!rgb
      ? [rgb[1], rgb[2], rgb[3]]
      : color
          .replace(
            /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
            function () {
              return (
                parseInt(arguments[1], 16) +
                ',' +
                parseInt(arguments[2], 16) +
                ',' +
                parseInt(arguments[3], 16)
              );
            }
          )
          .split(/,/);

  // Return RGB(A)
  return !!rgb
    ? 'rgb' +
        (alpha !== null ? 'a' : '') +
        '(' +
        Math[darker ? 'max' : 'min'](
          parseInt(decimal[0], 10) + difference,
          darker ? 0 : 255
        ) +
        ', ' +
        Math[darker ? 'max' : 'min'](
          parseInt(decimal[1], 10) + difference,
          darker ? 0 : 255
        ) +
        ', ' +
        Math[darker ? 'max' : 'min'](
          parseInt(decimal[2], 10) + difference,
          darker ? 0 : 255
        ) +
        (alpha !== null ? ', ' + alpha : '') +
        ')'
    : // Return hex
      [
        '#',
        pad(
          Math[darker ? 'max' : 'min'](
            parseInt(decimal[0], 10) + difference,
            darker ? 0 : 255
          ).toString(16),
          2
        ),
        pad(
          Math[darker ? 'max' : 'min'](
            parseInt(decimal[1], 10) + difference,
            darker ? 0 : 255
          ).toString(16),
          2
        ),
        pad(
          Math[darker ? 'max' : 'min'](
            parseInt(decimal[2], 10) + difference,
            darker ? 0 : 255
          ).toString(16),
          2
        ),
      ].join('');
};
const lightenColor = (color, ratio) => {
  return changeColor(color, ratio, false);
};
const darkenColor = (color, ratio) => {
  return changeColor(color, ratio, true);
};

export { lightenColor, darkenColor };
