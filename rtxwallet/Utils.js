export const timeout = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
