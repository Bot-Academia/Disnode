const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const https = require("https");
const axios = require("axios");
const ora = require("ora");
const execa = require("execa");

module.exports = {
  async execute(appname, author) {
    fs.mkdir(path.join(process.cwd(), appname), () => {
      console.log(chalk.green("Created default template"));
    });
    var data = null;
    const spinner = ora("Loading files").start();
    console.log("");

    axios
      .get(
        "https://api.github.com/repos/Bot-Academia/disnod/contents/template/default"
      )
      .then(async (res) => {
        arr = res.data;
        var i = 0;
        while (i < arr.length) {
          name = arr[i].name;
          console.log("");
          console.log(name);
          if (arr[i].type === "file") {
            await axios
              .get(
                `https://api.github.com/repos/Bot-Academia/disnod/contents/template/default/${name}`
              )
              .then((res) => {
                text = res.data.content;
                let buff = Buffer.from(text, "base64");
                let data = buff.toString("ascii");
                fs.appendFileSync(
                  path.join(process.cwd(), appname, name),
                  data,
                  function (e) {
                    if (e) console("some error");
                    console.log("Saved!");
                  }
                );
              });
          } else {
            fs.mkdir(path.join(process.cwd(), appname, "commands"), () => {
              console.log(chalk.green("Creating commands"));
            });

            await axios
              .get(
                "https://api.github.com/repos/Bot-Academia/disnod/contents/template/default/commands"
              )
              .then(async (res) => {
                a = res.data;
                var j = 0;
                while (j < a.length) {
                  name = a[j].name;
                  console.log("");
                  console.log("commands/" + name);
                  if (a[j].type === "file") {
                    await axios
                      .get(
                        `https://api.github.com/repos/Bot-Academia/disnod/contents/template/default/commands/${name}`
                      )
                      .then((res) => {
                        text = res.data.content;
                        let buff = Buffer.from(text, "base64");
                        let data = buff.toString("ascii");
                        fs.appendFileSync(
                          path.join(process.cwd(), appname, "commands", name),
                          data,
                          function (e) {
                            if (e) console("some error");
                            console.log("Saved!");
                          }
                        );
                      });
                  }
                  j++;
                }
              });
          } //else ends
          i++;
        }
        fs.readFile(`${appname}/package.json`, "utf-8", function (err, data) {
          if (err) throw err;

          var newValue = data.replace(
            /"author": "",/gim,
            ` "author": "` + author + `",`
          );
          fs.writeFile(`${appname}/package.json`, newValue, "utf-8", function (
            err,
            data
          ) {
            if (err) throw err;
            console.log("Done!");
          });
        });
        try {
          await execa("npm", ["install"], {
            cwd: process.cwd() + "/" + appname,
          });
        } catch (err) {
          console.log(err);
          throw err;
        }
        spinner.stop();
      });
  },
};
