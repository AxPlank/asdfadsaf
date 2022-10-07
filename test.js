let result = '';
let strr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()<>?[]{}';
let strrlen = strr.length;

for (let i = 0; i < 12; i++) {
    result += strr[Math.floor(Math.random() * strrlen)];
}

console.log(result);