var i = 0;
function doNothing() { }
do {
    if (i === 0) {
        for (var j = 0; j < 1; j++) {
            for (var _i = 0, _a = [1]; _i < _a.length; _i++) {
                var number = _a[_i];
                for (var stringsKey in ["a"]) {
                    while (i === 0) {
                        doNothing();
                    }
                }
            }
        }
    }
    i++;
} while (i < 1);
