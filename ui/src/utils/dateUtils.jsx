export const getLocalISOString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date - offset);
  return localTime.toISOString().slice(0, 16);
};