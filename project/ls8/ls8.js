const RAM = require('./ram');
const CPU = require('./cpu');
const fs = require('fs');

/**
 * Load an LS8 program into memory
 *
 * TODO: load this from a file on disk instead of having it hardcoded
 */
function processProgram(arr, cpu) {
    for (let i = 0; i < arr.length; i++) {
        cpu.poke(i, parseInt(arr[i], 2));
    }
    cpu.startClock();
}

function loadMemory(cpu, filename) {
    let program = [];
    if (process.argv.length === 3) {
        const lineReader = require('readline').createInterface({
            input: fs.createReadStream(process.argv[2])
        })
        lineReader.on('line', function(line) {
            // console.log(line);
            if (line.includes('#')) line = line.substring(0, line.indexOf('#'));
            
            if (line.length > 1) {
                // console.log(line);
                program.push(line);
            } else {
                return; 
            }
        })

        lineReader.on('close', function() {
            processProgram(program, cpu);
        })
    } else {
        console.log('Error: did you include a file name');
    }
}


/**
 * Main
 */

let ram = new RAM(256);
let cpu = new CPU(ram);

// TODO: get name of ls8 file to load from command line

loadMemory(cpu);

