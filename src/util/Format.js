export function formatDecimal(number, decimal) {
  let num = number.toString();
  const index = num.indexOf('.');
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1);
  } else {
    num = num.substring(0);
  }
  return parseFloat(num).toFixed(decimal);
}

export function formatMoney(value, unit = 2) {
  const val = parseFloat(value, 10) || 0;
  return (val / 100).toFixed(unit);
}

export function timeConversion(ms) {
  const millisec = Math.max(ms, 0);
  const seconds = (millisec / 1000).toFixed(0);
  const minutes = (millisec / (1000 * 60)).toFixed(0);
  const hours = (millisec / (1000 * 60 * 60)).toFixed(0);
  const days = (millisec / (1000 * 60 * 60 * 24)).toFixed(0);
  const years = (millisec / (1000 * 60 * 60 * 24 * 365)).toFixed(0);

  if (seconds < 60) return seconds + (seconds > 1 ? ' Secs' : ' Sec');
  if (minutes < 60) return minutes + (minutes > 1 ? ' Mins' : ' Min');
  if (hours < 24) return hours + (hours > 1 ? ' Hrs' : ' Hr');
  if (days < 365) return days + (days > 1 ? ' Days' : ' Day');
  return years + (years > 1 ? ' Years' : ' Year');
}
