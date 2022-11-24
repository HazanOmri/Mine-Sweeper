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
    for (var idxI = cell.i - 1; idxI <= cell.i + 1; idxI++) {
        if (idxI < 0 || idxI >= gBoard.length) continue
        for (var idxJ = cell.j - 1; idxJ <= cell.j + 1; idxJ++) {
            if (idxI === cell.i && idxJ === cell.j) continue
            if (idxI < 0 ||  idxJ>= gBoard[idxI].length) continue
            if (!gBoard[idxI][idxJ].isShown) count++
            console.log('count:',count)
        }
    }
    return count
}