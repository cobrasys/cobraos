import { JSCPP } from "./gpp/cpp.js";

export function Run(context) {
    const { stdout, args } = context;

    stdout.write('compiling...')
}
