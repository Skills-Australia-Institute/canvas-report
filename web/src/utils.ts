export const getDateTimeString = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth(); // Be careful! January is 0, not 1
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const dateString =
    year +
    '-' +
    (month + 1) +
    '-' +
    day +
    '-' +
    hour +
    '-' +
    minute +
    '-' +
    second;

  return dateString;
};

export const getFormattedName = (name: string) => {
  return name.trim().replace(/\s+/g, '_').replace(/,/g, '');
};
