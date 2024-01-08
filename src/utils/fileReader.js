const fs = require('fs');
function readLog(file) {
    let promise = new Promise((resolve, reject) => {
        try {
            fs.readFile(file, 'utf8', function (err, log) {
                if (err) {
                    return console.log(err);
                }
                let log_string = log.toString()
                resolve(log_string)
            });
        } catch (error) {
            reject({ message: error });
        }
    })
    return promise;
}
function parseLog(log) {
    return new Promise((resolve, reject) => {
        try {
            let lines = log.split(/[\n\r]/);
            var data_array = [];
            lines.map((line) => {
                var dataParams = line.split(/[\:]/);
                if (line !== '') {
                    var itemName = dataParams[0];
                    var itemPrice = dataParams[1];
                    data_array.push({ itemName, itemPrice});
                }
            });
            resolve(data_array);
        } catch (error) {
            reject({ message: error })
        }

    })
}



exports.readLog = readLog
exports.parseLog = parseLog