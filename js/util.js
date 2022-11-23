'use strict'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function getCellCoord(strCellId) {
    const coord = {}
    const parts = strCellId.split('-')
    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord
}