let i = 0;

function doNothing(): void {}

do {
  if (i === 0) {
    for (let j = 0; j < 1; j++) {
      for (const stringsKey in ["a"]) {
        for (const stringsKeyElement of [1]) {
          while (i === 0) {
            doNothing();
          }
        }
      }
    }
  } else {
    for (let j = 0; j < 1; j++) {
      for (let k = 0; k < 1; k++) {
        for (let l = 0; l < 1; l++) {
          doNothing();
        }
      }
    }
  }
  i++;
} while (i < 1);
