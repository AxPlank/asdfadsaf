const b = ((el) => {
    console.log(el);
})(3);

b;

function a (a) {

};

function c (str, cb) {
    return cb (str);
}

function cb (s, b, i, c) {
}

a = ((s, b, i, c) => {
    const temp = b
    for(b = i = 0; c = s.charCodeAt(i++); b += c >> 11? 3 : c >> 7 ? 2 : 1);
    return b + temp;
})('HELLO', 20);

console.log(a);