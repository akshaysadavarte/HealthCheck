export const calculateAverageLoadTime = function (array) {
    if (!array.length) { return 0; }
    const sum = array.reduce((a, b) => a + b);

    const avgLoadTimeInMilliseconds = sum / array.length;
    const avgLoadTimeInSeconds = convertMillisecondsToSeconds(avgLoadTimeInMilliseconds);
    return avgLoadTimeInSeconds;
}

export const getSmallDatetime = function (d) {
    return `${d.getFullYear()}-${d.getUTCMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

}

const convertMillisecondsToSeconds = function (milliseconds) {

    if (milliseconds == 0 || isNaN(milliseconds)) { return 0 };

    const ms = Math.round(milliseconds); // removing extra decimal from ms
    let seconds = ms / 1000; //converting ms to sec
    seconds = Math.round(seconds * 10) / 10 //Adjusting decimal 

    return seconds;
}
