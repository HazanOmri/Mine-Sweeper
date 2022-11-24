'use strict'

var gBoard
var gStartTime
var gTimerId
var gMinesCount
var gLive

var gHintsAmount
var gIsHint


const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

const gLevel = {
    size: 4,
    mines: 2
}

function onInitGame(size, mineAmount) {
    gGame.isOn = false
    gIsHint = false
    gMinesCount = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
    gLevel.size = size
    gLevel.mines = mineAmount
    gHintsAmount = 3
    gLive = 3
    if (mineAmount < gLive) gLive = mineAmount
    gBoard = buildBoard()
    renderBoard(gBoard)
    document.querySelector('h2').innerText = '😃'
    document.querySelector(".timer").innerText = '00:00'
    clearInterval(gTimerId)
    gTimerId = ''
}

function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        const row = []
        for (var j = 0; j < gLevel.size; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHint: false
            }
            row.push(cell)
        }
        board.push(row)
    }
    return board
}

function setMines(i, j) {
    if (gMinesCount >= gLevel.mines) return
    var idxI = getRandomInt(0, gLevel.size)
    var idxJ = getRandomInt(0, gLevel.size)
    if (gBoard[idxI][idxJ].isMine || (idxI === i && idxJ === j)) setMines(i, j)
    else {
        console.log('Mine:', idxI, idxJ)
        gBoard[idxI][idxJ].isMine = true
        gMinesCount++
        const elCurrCell = document.querySelector(`#cell-${idxI}-${idxJ}`)
        elCurrCell.classList.add('bomb')
        setMines(i, j)
    }
    setMinesNegsCount(gBoard)
}

function renderBoard(board) {
    var strHtml = ''
    var livesHTML = ''
    var hintsHTML = ''
    const elHint = document.querySelector('.hints')
    const elLive = document.querySelector('p')
    for (var i = 0; i < gHintsAmount; i++) {
        hintsHTML += '💡'
    }
    for (var i = 0; i < gLive; i++) {
        livesHTML += '❤️'
    }
    elHint.innerText = hintsHTML
    elLive.innerText = livesHTML
    for (var i = 0; i < board.length; i++) {
        var row = board[i]
        strHtml += '<tr>'
        for (var j = 0; j < row.length; j++) {
            var tdId = `cell-${i}-${j}`
            strHtml += `<td id="${tdId}" class="cell" onclick="cellClicked(this,${i},${j})"
             oncontextmenu="rightClicked(event,this,${i},${j})"></td>`
        }
        strHtml += '</tr>'
    }
    const elMat = document.querySelector('table')
    elMat.innerHTML = strHtml
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        var row = board[i]
        for (var j = 0; j < row.length; j++) {
            const cell = { i, j }
            const count = countMineNegs(cell)
            gBoard[i][j].minesAroundCount = count
        }
    }
}

function countMineNegs(cell) {
    var count = 0
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i === cell.i && j === cell.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isMine) count++
        }
    }
    return count
}

function openCell(cell, elCell, i, j) {
    if (gIsHint) {
        cell.isHint = true
        console.log(`i:${i} j:${j},shown: ${cell.isShown} hint:${cell.isHint}`)
    }
    else {
        cell.isShown = true
        gGame.shownCount++
        console.log(`i:${i} j:${j},shown: ${cell.isShown} hint:${cell.isHint}`)
    }
    if (cell.isMine) {
        elCell.innerHTML = `<img src="img/bomb.png" class="imgBomb">`
        mineClicked()
        if (!gIsHint) elCell.style.backgroundColor = 'red'
    } else {
        if (cell.minesAroundCount === 0) {
            elCell.style.backgroundColor = 'rgba(128, 128, 128, 0.553)'
            if (!gIsHint) gGame.shownCount += countUnShownNegs({ i: i, j: j })
            expandShown(gBoard, i, j)
        } else {
            for (var a = 1; a < 9; a++) {
                if (cell.minesAroundCount === a) {
                    elCell.innerHTML = `<img src="img/${a}.png" class="img${a}">`
                }
            }
        }
        console.log('how many', gGame.shownCount, gGame.markedCount)
        checkGameOver()
    }
}

function cellClicked(elCell, i, j) {
    if (checkGameOver()) return
    if (!gGame.isOn) {
        if (gIsHint) {
            gIsHint = false
            return
        }
        setMines(i, j)
        gGame.isOn = true
        startTimer()
    }

    const cell = gBoard[i][j]
    if (!cell.isShown && !cell.isMarked) {
        if (gIsHint && gGame.isOn) {
            console.log('hinti')
            hintClicked(cell, elCell, i, j)
        } else {
            console.log('click')
            openCell(cell, elCell, i, j)
        }
    }
}

function rightClicked(ev, elCell, i, j) {
    if (!gTimerId) startTimer()
    ev.preventDefault()
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = ''
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        return
    }
    if (gBoard[i][j].isShown) {
        return
    } else {
        elCell.innerHTML = `<img src="img/flag.png" class="flag">`
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        checkGameOver()
    }
}

function checkGameOver() {
    if (gLevel.size ** 2 === gGame.shownCount + gGame.markedCount) {
        gGame.isOn = false
        clearInterval(gTimerId)
        gTimerId = ''
        document.querySelector('h2').innerText = '😎'
        return true
    }
    if (gLive < 1) {
        console.log('ma nisgar')
        return true
    }
}

function startTimer() {
    gStartTime = Date.now()
    gTimerId = setInterval(() => {
        const seconds = (Date.now() - gStartTime) / 1000
        const elTimer = document.querySelector(".timer")
        elTimer.innerText = seconds.toFixed(2)
    }, 10)
}

function mineClicked() {
    gLive--
    const elLive = document.querySelector('p')
    if (gLive >= 1) {
        var strHTML = ''
        for (var i = 0; i < gLive; i++) {
            strHTML += '❤️'
        }
        console.log('elLive', elLive)
        elLive.innerText = strHTML
        console.log(gLive)
        return
    }
    else elLive.innerText = ''
    clearInterval(gTimerId)
    gGame.isOn = false
    gTimerId = ''
    var elCells = document.querySelectorAll('.cell.bomb')
    console.log(elCells)
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].innerHTML = `<img src="img/bomb.png" class="imgBomb">`
    }
    var elH2 = document.querySelector('h2')
    elH2.innerHTML = '🤯'
}

function expandShown(board, i, j) {
    console.log('negs');
    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        console.log('negs');
        if (idxI < 0 || idxI >= board.length) continue
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
            if (idxI === i && idxJ === j) continue
            if (idxJ < 0 || idxJ >= board[0].length) continue
            const elCurrCell = document.querySelector(`#cell-${idxI}-${idxJ}`)
            if (board[idxI][idxJ].isMine) {
                elCurrCell.innerHTML = `<img src="img/bomb.png" class="imgBomb">`
            } else {
                if (board[idxI][idxJ].minesAroundCount === 0) {
                    elCurrCell.style.backgroundColor = 'rgba(128, 128, 128, 0.553)'
                }
                for (var a = 1; a < 9; a++) {
                    if (board[idxI][idxJ].minesAroundCount === a) {
                        elCurrCell.innerHTML = `<img src="img/${a}.png" class="img${a}">`
                    }
                }
            }

            if (gIsHint) {
                board[idxI][idxJ].isHint = true
            }
            else {
                board[idxI][idxJ].isShown = true
            }
        }
    }
}

function hintClicked(cell, elCell, i, j) {
    gHintsAmount--
    var hintHTML = ''
    for (var a = 0; a < gHintsAmount; a++) {
        hintHTML += '💡'
    }
    document.querySelector('.hints').innerHTML = hintHTML
    openCell(cell, elCell, i, j)
    expandShown(gBoard, i, j)
    console.log('fast!')
    setTimeout(() => {
        gIsHint = false
        peekOff(i, j)
    }, 1000);

}

function onHint() {
    gIsHint = true
}

function peekOff(i, j) {
    console.log('ma habaya')
    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        if (idxI < 0 || idxI >= gBoard.length) continue
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
            if (idxJ < 0 || idxJ >= gBoard[0].length) continue
            const cell = gBoard[idxI][idxJ]
            if (cell.isShown) continue
            if (cell.isHint) {
                const elCell = document.querySelector(`#cell-${idxI}-${idxJ}`)
                elCell.style.backgroundColor = 'grey'
                elCell.innerHTML = ''
            }
        }
    }
}
