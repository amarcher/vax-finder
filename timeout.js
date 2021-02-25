function timeout(promise, cachedData, milliseconds) {
  const timeoutPromise = new Promise((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve(cachedData);
    }, milliseconds);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeoutPromise]);
}

module.exports = timeout;
