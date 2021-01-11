import { JSCPP } from "./gpp/cpp.js";

export default {
    Run: function (context) {
        const { stdout, args } = context;

        stdout.write('compiling...')
    }
}
