# test-icpc
acmicpc.net 문제들의 샘플 데이터를 자동으로 테스트해줍니다. 

## How to Install
`npm install -g test-icpc`

## Usage
test-icpc [problem number]  
test-icpc -n [problem number] -s [source code file (default: {problem number}.cpp)]  
           -e [binary file (default: {problem number}.bin)] -c [compiler (default: g++)]  
           -o [compile options (default: --std=c++11 -O3)]  
Extra options  
-f: force to reload sample data  
-h: show usage  