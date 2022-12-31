const str = '안녕';
const ByteLength = ((s, b, i, c) => {
    console.log(s);
    for(b = i = 0; c = s.charCodeAt(i++); b += c >> 11? 3 : c >> 7 ? 2 : 1) {
        console.log(`
s: ${s},
b: ${b},
i: ${i},
c: ${c}`);
    };
    return b;
})();

console.log(ByteLength);


// "type": "module" : import 사용 시 추가할 것