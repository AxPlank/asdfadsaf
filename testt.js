let arr = [
    {a: 1, b: 2},
    {a: 3, b: 4},
];

console.log(arr);

arr = arr.map((e) => {
    return e.a + e.b;
});

console.log(arr);

