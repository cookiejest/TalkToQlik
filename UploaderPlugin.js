const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const mashupname = require("./package.json").name;
const version = require("./package.json").version;


class UploaderPlugin {
    apply(compiler) {
        compiler.hooks.done.tapAsync("UploaderPlugin", (s, c) => {
            setTimeout(() => {
                // Creating form object
                const formData = new FormData();
                // Generating blob from createReadStream function using file path
                formData.append("filedata", fs.createReadStream(`./${mashupname + "_" + version}.zip`));
                formData.append("extname", mashupname);

                // Creating the request
                axios.create({ headers: formData.getHeaders() })
                    .post("https://w0w-qlikdeploy.herokuapp.com/deploy", formData)
                    .then(res => console.log(res))
                    .catch(error => console.error(error));
                c();
            }, 2000);
        });
    }
}

module.exports = UploaderPlugin;