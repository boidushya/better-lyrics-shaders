export const formatValue = (key: string, value: number): string => {
  return value.toFixed(key === 'rotation' ? 0 : 2);
};