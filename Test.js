var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var exec = require('child_process').exec;
var puppeteer = require('puppeteer');
var readline = require('readline-sync');

var baseUrl = 'https://www.acmicpc.net/problem/';
var submitUrl = 'https://www.acmicpc.net/submit/';
var statUrl = 'https://www.acmicpc.net/';

var argLength = process.argv.length;
var args = require('minimist')(process.argv.slice(2));

var problem = args.n;
var source = args.s;
var binary = args.e;
var compiler = args.c;
var cOptions = args.o;
var forceLoad = args.f;
var printUsage = args.h;
var submit = args.i;

if (problem == null) {
    problem = args._[0];
}

if (problem == null || printUsage) {
    console.log(`test-icpc [problem number]`);
    console.log(`test-icpc -n [problem number] -s [source code file (default: {problem number}.cpp)]`);
    console.log(`           -e [binary file (default: {problem number}.bin)] -c [compiler (default: g++)]`);
    console.log(`           -o [compile options (default: --std=c++11 -O3)]`);
    console.log(`Extra options`);
    console.log(`-f: force to compile and reload sample data`);
    console.log(`-i: skip tests and submit your code`);
    console.log(`-h: show usage`);
    return;
}
if (source == null) {
    source = problem + ".cpp";
}
if (compiler == null) {
    compiler = 'g++';
}
if (binary == null) {
    // compile and get name
    binary = './binary/' + problem + '.bin';
} 
if (cOptions == null && (compiler == 'g++' || compiler == 'c++' || compiler == 'cc')) {
    cOptions = '--std=c++11 -O3 -o ' + binary;
}
if (fs.existsSync('./binary') == false) {
    console.log("Create binary folder");
    fs.mkdirSync('./binary');
}
if (fs.existsSync('./data') == false) {
    console.log("Create data folder");
    fs.mkdirSync('./data');
}
if (fs.existsSync('./result') == false) {
    console.log("Create result folder");
    fs.mkdirSync('./result');
}


var inputList = [];
var outputList = [];

if (submit) {
	submitCode();
} else if (forceLoad ||  fs.existsSync(binary) == false) {
    console.log("Compile the source code");
    exec(compiler + ' ' + source + ' ' + cOptions, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        }
        sampleTest();
    }); //end of exec
} else {
    sampleTest();
}


function getSampleAndRunTest() {
    request.get('https://www.acmicpc.net/problem/' + problem, (err, response, body) => {
        if (err) {
            console.log(err);
            return;
        }
        var $ = cheerio.load(body);
        $('.sampledata').each( function(i, elem) {
            var id = $(this).attr('id');
            // get id number 
            index = id[id.length-1];
            var path = `./data/${problem}/${index}`;
            if (id.includes('input')) {
                inputList.push(index); // save input data list
                // console.log("Input data " + index + ": " + $(this).text()) 
                fs.writeFileSync(`${path}.in`, $(this).text());
            } else if (id.includes('output')){
                outputList.push(index); // save input data list
                // console.log("Output data " + index + ": " + $(this).text())
                fs.writeFileSync(`${path}.out`, $(this).text());
                // fs.appendFileSync(`${path}.out`, '\n');
            }
        }); // end of $('.sampledata')
        runTest();
    }); // end of request(acmicpc.net)
}
function runTest() {
	var passed = true;
    inputList.forEach(idx => {
        if (outputList.includes(idx)) {
            process.stdout.write(`Run test ${idx}\n`);
            exec(`${binary} < ./data/${problem}/${idx}.in > ./result/${problem}-${idx}.res` , (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(`Can not run test ${idx}`);
                    return;
                }
                exec(`diff -w ./data/${problem}/${idx}.out ./result/${problem}-${idx}.res` , (err, stdout, stderr) => {
                    if (stdout.length == 0) {
                        console.log(`${idx} Passed\n`);
                    } else {
                        console.log(`Failed\n`);
						passed = false;
                    }
                });
            });
        }
    }); // end of test and diff
}

function sampleTest() {
    if (fs.existsSync(`./data/${problem}`) == false) {
        fs.mkdirSync(`./data/${problem}`);
        console.log("Get sample data");
        getSampleAndRunTest();
    } else if (forceLoad || fs.readdirSync(`./data/${problem}`).length == 0){
        console.log("Get sample data");
        getSampleAndRunTest();
    } else {
        // if sample data existx already
        // do not load data
        var files = fs.readdirSync(`./data/${problem}`);
        files.forEach(fname => {
            if (fname.includes('in')) {
                console.log(fname.split('.')[0]);
                inputList.push(fname.split('.')[0]);
            } else {
                outputList.push(fname.split('.')[0]);
            }
        });

        runTest();
    }
}

function submitCode() {
    var id = readline.question('Your id: ');
    var pw = readline.question('Your pw: ', {hideEchoBack: true});
    
    var code = fs.readFileSync(source, 'utf8').toString();
    (async() => {
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        console.log("Go to BOJ");
        const response = await page.goto(submitUrl + problem, {waitUntil: 'domcontentloaded'});
        
        await page.type('input.form-control[name="login_user_id"]', id);
        await page.type('input.form-control[name="login_password"]', pw);

        console.log("Try to login");
        await page.click('button.pull-right[type="submit"]');

        await page.waitForNavigation( {
            waitUntil:'load', 
            timeout: 0
        });

        console.log("Type code");
        await page.type('.CodeMirror-code', code + '/*');
        await page.click('.CodeMirror-code');
        await page.keyboard.down('ControlLeft')
        await page.keyboard.press('End');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.type('*/');
        await page.click('button.btn.btn-primary');
        
        console.log("Fetch a result");
        await page.waitForNavigation({
            waitUntil:'load',
            timeout: 0
        });

        await page.pdf({path:'test7.pdf'});

        await browser.close();
    })();
}
