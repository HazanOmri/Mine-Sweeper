'use strict'

var gBoard
var gStartTime
var gTimerId
var gMinesCount


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
    gMinesCount = 0
    gGame.shownCount = 0
    gGame.markedCount = 0
    gLevel.size = size
    gLevel.mines = mineAmount
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
                isMarked: false
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
        console.log(elCurrCell);
        setMines(i, j)
    }
    setMinesNegsCount(gBoard)
    console.log('gBoard', gBoard)
}

function renderBoard(board) {
    var strHtml = ''
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

function cellClicked(elCell, i, j) {
    checkGameOver()
    if (!gGame.isOn) {
        setMines(i, j)
        gGame.isOn = true
        startTimer()
    }
    const cell = gBoard[i][j]
    if (!cell.isShown && !cell.isMarked) {
        if (cell.isMine) {
            mineClicked()
        } else {
            if (cell.minesAroundCount === 0) {
                cell.isShown = true
                elCell.style.backgroundColor = 'rgba(128, 128, 128, 0.553)'
                console.log('countNegs', countUnShownNegs({ i: i, j: j }))
                gGame.shownCount += countUnShownNegs({ i: i, j: j })
                console.log('hi')
                expandShown(gBoard, elCell, i, j)
            } else {
                for (var a = 1; a < 9; a++) {
                    if (cell.minesAroundCount === a) {
                        elCell.innerHTML = `<img src="img/${a}.png" class="img${a}">`
                    }
                }
            }
            gBoard[i][j].isShown = true
            gGame.shownCount++
            checkGameOver()
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
    console.log(gGame.shownCount, gGame.markedCount)
    if (gLevel.size ** 2 === gGame.shownCount + gGame.markedCount) {
        gGame.isOn = false
        clearInterval(gTimerId)
        document.querySelector('h2').innerText = '😎'
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
    clearInterval(gTimerId)
    gGame.isOn = false
    var elCells = document.querySelectorAll('.cell.bomb')
    console.log(elCells)
    console.log('boom')
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].innerHTML = `<img src="img/bomb.png" class="imgBomb">`
    }
    var elH2 = document.querySelector('h2')
    elH2.innerHTML = '🤯'
}

function expandShown(board, elCell, i, j) {
    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        if (idxI < 0 || idxI >= board.length) continue
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
            if (idxI === i && idxJ === j) continue
            if (idxJ < 0 || idxJ >= board[0].length) continue
            const elCurrCell = document.querySelector(`#cell-${idxI}-${idxJ}`)
            if (board[idxI][idxJ].minesAroundCount === 0) {
                gBoard[idxI][idxJ].isShown = true
                elCurrCell.style.backgroundColor = 'rgba(128, 128, 128, 0.553)'
                gBoard[idxI][idxJ].isShown = true
            }
            for (var a = 1; a < 9; a++) {
                if (board[idxI][idxJ].minesAroundCount === a) {
                    elCurrCell.innerHTML = `<img src="img/${a}.png" class="img${a}">`
                    gBoard[idxI][idxJ].isShown = true
                }
            }
        }
    }
}