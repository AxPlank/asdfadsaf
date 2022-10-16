const PatternID = /\W/;

const str = 'aaadad1aa@aa';

console.log(str.match(PatternID));

if (str.length >= 5 && !str.match(PatternID)) {
    console.log(1);
}
