import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
        <button className={props.isWinSquare?"win-square":"square"} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        let f=false;
        if(this.props.winColList){
            for(let j=0;j<this.props.winColList.length;j++){

                if(i===this.props.winColList[j]){
                    f=true;
                    break;
                }

            }
        }
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isWinSquare={f}
            />
        );
    }

    drawBoard(){
        const numCol=this.props.numCol;
        let id=0;
        let rowListOfBoard=[];

        for(let i =0; i < numCol; i++) {
            let listSquare = [];
            for (let j = 0; j < numCol; j++) {
                listSquare.push(this.renderSquare(id++));
            }

            rowListOfBoard.push(
                <div className="board-row" key={i}>
                    {listSquare}
                </div>
            );
        }

        return rowListOfBoard;
    }
    render() {
        return (
            <div>
                {this.drawBoard()}
            </div>
        );
    }
}
class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: [
                {
                    squares: Array(196).fill(null)//196=14*14
                }
            ],
            historyOfOxy:[],
            winColList:[],
            endGame:false,
            stepNumber: 0,
            xIsNext: true,
            sortStep:false,
            numCol: 14// num col of board
        };
    }

    handleClick(i) {
        if(this.state.endGame){
            return;
        }else{
            const history = this.state.history.slice(0, this.state.stepNumber + 1);
            const current = history[history.length - 1];
            const squares = current.squares.slice();

            const currentOxy=this.state.historyOfOxy.slice(0,this.state.stepNumber);

            squares[i] = this.state.xIsNext ? "X" : "O";
            currentOxy.push(i);

            let winColList=calculateWinner(i,this.state.numCol,squares);
            let f = winColList?true:false;
            this.setState({
                history: history.concat([
                    {
                        squares: squares
                    }
                ]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
                historyOfOxy:currentOxy,
                winColList:winColList,
                endGame:f
            });
        }
    }

    convertIndexToOxy(i){
        var n = this.state.numCol;
        var x,y;
        x=i%n;
        y=Math.floor(i/n);
        return '('+x+','+y+')';
    }

    getClassNameForMoving(move){
        let className;
        if((move===this.state.historyOfOxy.length&&this.state.sortStep===false)||(move===0&&this.state.sortStep))
        {
            className='btn btn-danger';
        }
        else{
            if(this.state.endGame)
                className='btn btn-default';
            else
                className='btn btn-primary';
        }
        return className;
    }

    jumpTo(step) {
        if(this.state.endGame){}
        else{
            this.setState({
                stepNumber: step,
                xIsNext: (step % 2) === 0
            });
        }

    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const moves = history.map((step, move) => {
            let desc;
            if(this.state.sortStep){
                if(history.length===1){
                    desc='Trò chơi bắt đầu';
                }else{
                    desc = move!==history.length-1 ?
                        'Di chuyển #' +  this.convertIndexToOxy(this.state.historyOfOxy[this.state.historyOfOxy.length-move-1]):
                        'Trò chơi bắt đầu';
                }
            }else{
                desc = move ?
                    'Di chuyển #' +  this.convertIndexToOxy(this.state.historyOfOxy[move-1]):
                    'Trò chơi bắt đầu';
            }
            let classNameForMoving=this.getClassNameForMoving(move);
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} className={classNameForMoving}>{desc}</button>
                </li>
            );
        });
        let status;
        if (this.state.endGame) {
            if(this.state.xIsNext)
                status = "Người thắng: O";
            else
                status = "Người thắng: X";
        } else {
            status = "Người chơi: " + (this.state.xIsNext ? "X" : "O");
        }
        return (
            <div className="game">
                <div className="col-md-2"></div>
                <div className="col-md-5">
                    <div className="panel panel-info">
                        <div className="panel-heading">
                            <h3 className="panel-title">Game caro</h3>
                        </div>
                        <div className="panel-body">
                            <div className="game-board">
                                <Board
                                    winColList={this.state.winColList}
                                    squares={current.squares}
                                    numCol={this.state.numCol}
                                    onClick={i => this.handleClick(i)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <h3 className="panel-title">Lịch sử di chuyển</h3>
                        </div>
                        <div className="panel-body">
                            <div className="game-info">
                                <div>
                                    {status}
                                </div>
                                <div>
                                    <button id="btn-sort" className="btn btn-info" onClick={()=>{this.setState({sortStep:this.state.sortStep?false:true});}}>Sắp xếp</button>
                                    <button id="btn-newGame" className="btn btn-success" onClick={()=>{window.location.reload();}}>New game</button>
                                </div>
                                <hr/>
                                <div className="scrollbar" id="style-7">
                                    <div className="force-overflow">
                                        <ol>{moves}</ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(j,n,squares) {
    let winSquareList = checkingTheWinHor(j,n,squares);
    if(winSquareList){
        return winSquareList;
    }else{
        winSquareList = checkingTheWinVer(j,n,squares);
        if(winSquareList){
            return winSquareList;
        }else{
            winSquareList = checkingTheWinRightDia(j,n,squares);
            if(winSquareList){
                return winSquareList;
            }else{
                winSquareList = checkingTheWinLeftDia(j,n,squares);
                return winSquareList?winSquareList:null;
            }
        }
    }
}

function checkingTheWinHor(j,n,squares) {
    const row=getRow(j,n);
    for(let i=row*n;i<row*n+n-4;i++){
        if(squares[i]&&squares[i]===squares[i+1]&&
            squares[i]===squares[i+2]&&squares[i]===squares[i+3]&& squares[i]===squares[i+4]){
            return [i,i+1,i+2,i+3,i+4];
        }
    }
    return null;
}
function checkingTheWinVer(j,n,squares) {
    const col=getCol(j,n);
    for(let i=col;i<col+n*10;i+=n){
        if(squares[i]&&squares[i]===squares[i+n]&&
            squares[i]===squares[i+2*n]&&squares[i]===squares[i+3*n]&& squares[i]===squares[i+4*n]){
            return [i,i+n,i+2*n,i+3*n,i+4*n];
        }
    }
    return null;
}
function checkingTheWinRightDia(j,n,squares) {
    let row = getRow(j,n);//y
    let col = getCol(j,n);//x
    let row2 = row;
    let col2 = col;
    let before=0,after=0;
    let win=[];
    win.push(j);
    for(let i = 0;i<4;i++){
        row--; col--;
        if(row>=0 && col>=0 && squares[j] && squares[j]===squares[j-15*(i+1)]){
            before++;
            win.push(j-15*(i+1));
        }else{
            break;
        }
    }
    for(let i = 0;i<4;i++){
        row2++; col2++;
        if(row2<=13 && col2<=13 && squares[j] && squares[j]===squares[j+15*(i+1)]){
            before++;
            win.push(j+15*(i+1));
        }else{
            break;
        }
    }
    if(before+after===4){
        return win;
    }
    return null;
}
function checkingTheWinLeftDia(j,n,squares) {
    let row = getRow(j,n);//y
    let col = getCol(j,n);//x
    let row2 = row;
    let col2 = col;
    let before=0,after=0;
    let win=[];
    win.push(j);
    for(let i = 0;i<4;i++){
        row--; col--;
        if(row>=0 && col>=0 && squares[j] && squares[j]===squares[j-13*(i+1)]){
            before++;
            win.push(j-13*(i+1));
        }else{
            break;
        }
    }
    for(let i = 0;i<4;i++){
        row2++; col2++;
        if(row2<=13 && col2<=13 && squares[j] && squares[j]===squares[j+13*(i+1)]){
            before++;
            win.push(j+13*(i+1));
        }else{
            break;
        }
    }
    if(before+after===4){
        return win;
    }
    return null;
}
function getCol(i,n) {
    return i%n;
}
function getRow(i,n) {
    return Math.floor(i/n);
}