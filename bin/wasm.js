
const wasmRun = (context) => {
    const { stdout, args } = context;
    
    if(args.length > 0) {
        let code = '';

        let completestring = `window.virtualDrive['']`;
        if(window.directory != '') {
            let workingdirectorysplit = window.directory.slice(1).split('/');

            workingdirectorysplit.forEach(element => {
                // build eval string
                completestring += `['${element}']`;
            });
        }

        if(eval(completestring)) {
            var directory = eval(completestring);
            
            if(directory[args.slice(-1)[0]] instanceof VirtualFile) {
                code = directory[args.slice(-1)[0]].content;
                function printString(offset, length) {
                    var bytes = new Uint8Array(memory.buffer, offset, length);
                    var string = new TextDecoder('utf8').decode(bytes);
                    term.write(string);
                }

                var binaryBuffer;
                var module = wabt.parseWat('main.wat', code);
                module.resolveNames();
                module.validate();
                var binaryOutput = module.toBinary({log: true});
                binaryBuffer = binaryOutput.buffer;
                module.destroy();

                let wasm = new WebAssembly.Module(binaryBuffer);
                const memory = new WebAssembly.Memory({initial:1});

                const env = {
                    env: {
                        printf: function (offset, length) {
                            printString(offset, length);
                        },
                    },
                    js: {
                        mem: memory,
                    },
                };

                const wasmInstance = new WebAssembly.Instance(wasm, env);
                let output = wasmInstance.exports.main();
                term.write('\r\n');
                term.writeln('=> ' + output);
                return;
            
            } else {
                stdout.writeln('wasm: ' + args.slice(-1)[0] + ': is not a file')
                return;
            }
        }
    }
}

window.Packages['wasm'] = wasmRun;
