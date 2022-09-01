module.exports = function (n, block) {
    console.log('times')
    let accum = '';
    for (let i = 0; i < n; ++i) accum += block.fn(i);
    return accum;
}