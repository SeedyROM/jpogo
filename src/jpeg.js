/**
 * Binary JPEG helpers and data moshing utilities
 * @module
 */

/**
 * Convert a filepath to a data url
 * @param {File} file
 * @return {Promise<Uint8Array>}
 */
export const jpegToTypedArray = file => {
  if (!file) return;
  const reader = new FileReader();
  return new Promise((res, rej) => {
    reader.addEventListener(
      "load",
      () => {
        res(new Uint8Array(reader.result));
      },
      false
    );
    reader.addEventListener("error", error => {
      rej(error);
    });

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Find the DQT in a JPEG binary
 * @param {Uint8Array} data
 * @returns {number} offset
 */
export const quantizationTableOffset = data => {
  let i = 0;
  for (; i < data.length - 1; i++) {
    if (data[i] === 0xff && data[i + 1] === 0xdb) break;
  }
  return i + 1;
};

/**
 * Find the DRI in a JPEG binary
 * @param {Uint8Array} data
 * @returns {number} offset
 */
export const restartIntervalOffset = data => {
  let i = 0;
  for (; i < data.length - 1; i++) {
    console.log(i);
    if (data[i] === 0xff && data[i + 1] === 0xdd) break;
  }
  return i + 1;
};

/**
 * DQT effectors
 */
export const dqtEffectors = {
  exposure: {
    offset: 4,
    min: 0x00,
    max: 0xff
  }
};

/**
 * DRI effectors
 */
export const driEffectors = {
  shift: {
    offset: 4,
    min: 0x00,
    max: 0x28
  }
};

/**
 * Global effectors
 */
export const effectors = {
  dqt: dqtEffectors,
  dri: driEffectors
};
