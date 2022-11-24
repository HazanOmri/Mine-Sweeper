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

function getSelector(coord) {
    return `#cell-${coord.i}-${coord.j}`
}

function countUnShownNegs(cell) {
    var count = 0
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i === cell.i && j === cell.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (!gBoard[i][j].isShown) count++
        }
    }
    return count
}