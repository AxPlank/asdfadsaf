const timer = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(time);
        }, time);
    });
}

timer(1000).then((time) => {
    console.log(time);
    time += 1000;
    return timer(time);
}).then((time) => {
    console.log(time);
    time += 1000;
});