# test-icpc
acmicpc.net 문제들의 샘플 데이터를 자동으로 테스트해줍니다. 
원하는 경우 샘플 코드를 제출할 수 있습니다. (예정)

## How to Install
`npm install -g test-icpc`

## Usage
```
test-icpc [problem number]  
test-icpc -n [problem number] -s [source code file (default: {problem number}.cpp)]  
           -e [binary file (default: {problem number}.bin)] -c [compiler (default: g++)]  
           -o [compile options (default: --std=c++11 -O3)]  
Extra options  
-f: force to reload sample data 
-i: skip tests and submit your code 
-h: show usage  
```

## Requirements
This project was tested on Ubuntu linux only. On the MAC, Windows or WSL (Windows Subsystem Linux), this project will not run. 

If there is an error on `puppeteer`, install `chromium-browser` using `sudo apt-get install chromium-browser`. or use script below: 
```bash
sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```