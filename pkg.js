
var __gpp = document.createElement('script');

__gpp.setAttribute('src','bin/g++.js');

document.head.appendChild(__gpp);

var __py = document.createElement('script');

__py.setAttribute('src','bin/python.js');

document.head.appendChild(__py);

var __compress = document.createElement('script');

__compress.setAttribute('src','bin/compressionutils.js');

document.head.appendChild(__compress);

var __wasm = document.createElement('script');

__wasm.setAttribute('src','bin/wasm.js');

document.head.appendChild(__wasm);

var __lua = document.createElement('script');

__lua.setAttribute('src','bin/lua.js');

document.head.appendChild(__lua);

window.Packages = {};
/*
window.Packages.wget = function(context) {
	const { stdout, args } = context;
    if(args.length == 1) {
        window.showPrompt = false;
        fetch(args[0]).then(response => response.text())
      .then(data => { 
            term.write(data); 
            window.showPrompt = true
            term.write('\r\n')
            term.prompt()
        });
    }
	
}

*/


window.Packages.pkg = async function(context) {
    const { stdout, args, user } = context;

    if(args.length == 0) return;
    switch(args[0]) {
        case 'uninstall':
            if(user != 0) {
                stdout.writeln('pkg: ERROR: missing permissions to write to package directory, are you root?');
                return;
            }
            if(window.Packages[args[1]]) {
                stdout.writeln('uninstalling local package... ' + args[1]);
                delete window.Packages[args[1]];
                return;
            } else {
                stdout.writeln('pkg: uninstall: ' + args[1] + ': package does not exist or is not installed');
                return;
            }

        case 'list':
            window.showPrompt = false;
            stdout.writeln('pkg: list: fetching package lists...');
            let ssources = window.virtualDrive['']['etc']['pkg']['sources.list'].content.split('\n');
            await ssources.forEach(async (source, index) => {
                if(source.startsWith('#')) return;
                let namesource = source.split(' : ')[0]
                let urlsource = source.split(' : ')[1];
                if(namesource == undefined || urlsource == undefined) return;
                stdout.writeln(`GET ${namesource}: ${urlsource}`);
                let rresponse = await fetch(urlsource);
                let ddata = await rresponse.json();

                let pprovider = ddata.provider;
                let ppackages = ddata.packages;
                stdout.write('\r\n\r\n');
                stdout.writeln('pkg: list: packages found:');
                stdout.write('\r\n');
                Object.keys(ppackages).forEach(name => {
                    stdout.writeln(name);
                });
            })
            window.showPrompt = true

            break;
        
        case 'addsource':
            if(user != 0) {
                stdout.writeln('pkg: ERROR: missing permissions to write to package directory, are you root?');
                return;
            }
            window.showPrompt = false;
            stdout.writeln('pkg: adding package list...');

            let rrresponse = await fetch(args[1]);
            let dddata = await rrresponse.json();

            let ppprovider = dddata.provider;
            let pppackages = dddata.packages;
            console.log(ppprovider);

            stdout.writeln('pkg: writing changes to local package list');
            window.virtualDrive['']['etc']['pkg']['sources.list'].append(`${ppprovider} : ${args[1]}`);
            window.showPrompt = true;
            stdout.prompt();
            break;
        case 'install':
            if(user != 0) {
                stdout.writeln('pkg: ERROR: missing permissions to write to package directory, are you root?');
                return;
            }
            _babelPolyfill = false;
            if(args.length != 2) return;
            window.showPrompt = false;
            let sources = window.virtualDrive['']['etc']['pkg']['sources.list'].content.split('\n');
            stdout.writeln('pkg: install: ' + args[1] + ': fetching package lists...');
            await sources.forEach(async (source, index) => {
                if(source.startsWith('#')) return;
                let namesource = source.split(' : ')[0];
                let urlsource = source.split(' : ')[1];
                if(namesource == undefined || urlsource == undefined) return;
                stdout.writeln(`GET ${namesource}: ${urlsource}`);
                let response = await fetch(urlsource);
                let data = await response.json();

                let provider = data.provider;
                let packages = data.packages;
                if(Object.keys(packages).includes(args[1])) {
                    let version = data.packages[args[1]].version;
                    let codesource = data.packages[args[1]].codesource;
                    let codetype = data.packages[args[1]].codetype;
                    console.log(data);
                    stdout.writeln('pkg: install: ' + args[1] + ': fetching package source...');
                    stdout.writeln('GET: ' + codesource);
                    let response = await fetch(codesource);
                    let code = await response.text();
                    if(codetype == 'javascript' || codetype == 'js') {
                        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

                        code = `
                        const { stdout, args, user } = arguments[0];
                        window.showPrompt = false;
                        ${code}
                        window.showPrompt = true;
                        `;
                        let codefunc = new AsyncFunction(code);
                        window.Packages[args[1]] = codefunc;
                    } else if(codetype == 'wasm') {
                        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

                        code = `
                        const { stdout, args, user } = arguments[0];

                        window.showPrompt = false;
                        var binaryBuffer;

                        let code = \`${code}\`;
                        var module = wabt.parseWat('main.wat', code);
                        module.resolveNames();
                        module.validate();
                        var binaryOutput = module.toBinary({log: true});
                        binaryBuffer = binaryOutput.buffer;
                        module.destroy();

                        let wasm = new WebAssembly.Module(binaryBuffer);
                        const memory = new WebAssembly.Memory({initial:1});

                        function printString(offset, length) {
                            var bytes = new Uint8Array(memory.buffer, offset, length);
                            var string = new TextDecoder('utf8').decode(bytes);
                            term.writeln(string);
                        }

                        const env = {
                            env: {
                                printf: function (offset, length) {
                                    printString(offset, length);
                                },
                            },
                            js: {
                                mem: memory,
                            },
                            stdio: {
                                outint: term.writeln,
                                outstr: printString,
                            }
                        };

                        const wasmInstance = new WebAssembly.Instance(wasm, env);
                        wasmInstance.exports.main();
                        window.showPrompt = true;
                        `;
                        let codefunc = new AsyncFunction(code);
                        window.Packages[args[1]] = codefunc;
                    } else {
                        stdout.writeln('pkg: install: ' + args[1] + ': invalid `codetype` expected `wasm`, `js` or `javascript`');
                        window.showPrompt = true;
                        term.prompt();
                        return;
                    }

                    stdout.writeln('pkg: install: ' + args[1] + ': writing changes to local packages')
                    window.showPrompt = true;
                    term.prompt();
                    return;
                } else {
                    return;
                }
            });
            window.showPrompt = true;
            //term.prompt();
            
            return;
    }
}