import React from 'react'
import './SnakeGame.css'
import GameOver from './GameOver.jsx'

class SnakeGame extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)

    '',
      (this.state = {
        width: 0,
        height: 0,
        blockWidth: 0,
        blockHeight: 0,
        gameLoopTimeout: 100,
        timeoutId: 0,
        startSnakeSize: 0,
        snake: [],
        apple: {},
        direction: 'right',
        directionChanged: false,
        isGameOver: false,
        snakeColor: this.props.snakeColor || this.getRandomColor(),
        appleColor: this.props.appleColor || this.getRandomColor(),
        score: 0,
        highScore: localStorage.getItem('snakeHighScore'),
        newHighScore: false,
        applePointsArray: [1, 5, 10],
        applePoints: 1,
        prevBoost: 0,
        isPaused: false,
      })
  }

  componentDidMount() {
    this.initGame()
    window.addEventListener('keydown', this.handleKeyDown)
    this.gameLoop()
  }

  initGame() {
    // Game size initialization
    let percentageWidth = this.props.percentageWidth || 40
    let width =
      document.getElementById('GameBoard').parentElement.offsetWidth *
      (percentageWidth / 100)
    width -= width % 30
    if (width < 30) width = 30
    let height = (width / 3) * 2
    let blockWidth = width / 30
    let blockHeight = height / 20

    // snake initialization
    let startSnakeSize = this.props.startSnakeSize || 6
    let snake = []
    let Xpos = width / 2
    let Ypos = height / 2
    let snakeHead = { Xpos: width / 2, Ypos: height / 2 }
    snake.push(snakeHead)
    for (let i = 1; i < startSnakeSize; i++) {
      Xpos -= blockWidth
      let snakePart = { Xpos: Xpos, Ypos: Ypos }
      snake.push(snakePart)
    }

    // apple position initialization
    let appleXpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    let appleYpos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (appleYpos === snake[0].Ypos) {
      appleYpos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    this.setState({
      width,
      height,
      blockWidth,
      blockHeight,
      startSnakeSize,
      snake,
      apple: { Xpos: appleXpos, Ypos: appleYpos },
    })
  }

  gameLoop() {
    let timeoutId = setTimeout(() => {
      if (!this.state.isGameOver && !this.state.isPaused) {
        this.moveSnake()
        this.tryToEatSnake()
        this.tryToEatApple()
        this.setState({ directionChanged: false })
      }

      this.gameLoop()
    }, this.state.gameLoopTimeout)

    this.setState({ timeoutId })
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId)
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  resetGame() {
    let width = this.state.width
    let height = this.state.height
    let blockWidth = this.state.blockWidth
    let blockHeight = this.state.blockHeight
    let apple = this.state.apple

    // snake reset
    let snake = []
    let Xpos = width / 2
    let Ypos = height / 2
    let snakeHead = { Xpos: width / 2, Ypos: height / 2 }
    snake.push(snakeHead)
    for (let i = 1; i < this.state.startSnakeSize; i++) {
      Xpos -= blockWidth
      let snakePart = { Xpos: Xpos, Ypos: Ypos }
      snake.push(snakePart)
    }

    // apple position reset
    apple.Xpos =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth
    apple.Ypos =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight
    while (this.isAppleOnSnake(apple.Xpos, apple.Ypos)) {
      apple.Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple.Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
    }

    this.setState({
      snake,
      apple,
      direction: 'right',
      directionChanged: false,
      isGameOver: false,
      gameLoopTimeout: 100,
      snakeColor: this.getRandomColor(),
      appleColor: this.getRandomColor(),
      score: 0,
      newHighScore: false,
    })
  }

  getRandomColor() {
    let hexa = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) color += hexa[Math.floor(Math.random() * 16)]
    return color
  }

  moveSnake() {
    let snake = this.state.snake
    let previousPartX = this.state.snake[0].Xpos
    let previousPartY = this.state.snake[0].Ypos
    let tmpPartX = previousPartX
    let tmpPartY = previousPartY
    this.moveHead()
    for (let i = 1; i < snake.length; i++) {
      tmpPartX = snake[i].Xpos
      tmpPartY = snake[i].Ypos
      snake[i].Xpos = previousPartX
      snake[i].Ypos = previousPartY
      previousPartX = tmpPartX
      previousPartY = tmpPartY
    }
    this.setState({ snake })
  }

  tryToEatApple() {
    let snake = this.state.snake
    let apple = this.state.apple
    console.log(this.state.name)

    // if the snake's head is on an apple
    if (snake[0].Xpos === apple.Xpos && snake[0].Ypos === apple.Ypos) {
      let width = this.state.width
      let height = this.state.height
      let blockWidth = this.state.blockWidth
      let blockHeight = this.state.blockHeight
      let newTail = { Xpos: apple.Xpos, Ypos: apple.Ypos }
      let newHighScore = this.state.newHighScore
      let gameLoopTimeout = this.state.gameLoopTimeout
      let applePointsArray = this.state.applePointsArray
      let applePoint = applePointsArray[Math.round(Math.random() * 2)]

      // increase snake size
      snake.push(newTail)

      // create another apple
      apple.Xpos =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth
      apple.Ypos =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight
      while (this.isAppleOnSnake(apple.Xpos, apple.Ypos)) {
        apple.Xpos =
          Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
          blockWidth
        apple.Ypos =
          Math.floor(
            Math.random() * ((height - blockHeight) / blockHeight + 1)
          ) * blockHeight
      }

      // increment high score
      if (this.state.score + applePoint > this.state.highScore) {
        this.setState({
          highScore: this.state.score + applePoint,
        })
        localStorage.setItem(
          'snakeHighScore',
          JSON.stringify(this.state.highScore, this.state.name)
        )
        newHighScore = true
      }

      // decrease the game loop timeout
      let boost = Math.floor((this.state.score + applePoint) / 50)
      let prevBoost = this.state.prevBoost
      if (boost != prevBoost) {
        gameLoopTimeout -= boost * 4
        console.log(gameLoopTimeout)
      }

      this.setState({
        snake,
        apple,
        score: this.state.score + applePoint,
        newHighScore,
        gameLoopTimeout,
        prevBoost: boost,
      })
    }
  }

  tryToEatSnake() {
    let snake = this.state.snake

    for (let i = 1; i < snake.length; i++) {
      if (snake[0].Xpos === snake[i].Xpos && snake[0].Ypos === snake[i].Ypos)
        this.setState({ isGameOver: true })
    }
  }

  isAppleOnSnake(appleXpos, appleYpos) {
    let snake = this.state.snake
    for (let i = 0; i < snake.length; i++) {
      if (appleXpos === snake[i].Xpos && appleYpos === snake[i].Ypos)
        return true
    }
    return false
  }

  moveHead() {
    switch (this.state.direction) {
      case 'left':
        this.moveHeadLeft()
        break
      case 'up':
        this.moveHeadUp()
        break
      case 'right':
        this.moveHeadRight()
        break
      default:
        this.moveHeadDown()
    }
  }

  moveHeadLeft() {
    let width = this.state.width
    let blockWidth = this.state.blockWidth
    let snake = this.state.snake
    snake[0].Xpos =
      snake[0].Xpos <= 0 ? width - blockWidth : snake[0].Xpos - blockWidth
    this.setState({ snake })
  }

  moveHeadUp() {
    let height = this.state.height
    let blockHeight = this.state.blockHeight
    let snake = this.state.snake
    snake[0].Ypos =
      snake[0].Ypos <= 0 ? height - blockHeight : snake[0].Ypos - blockHeight
    this.setState({ snake })
  }

  moveHeadRight() {
    let width = this.state.width
    let blockWidth = this.state.blockWidth
    let snake = this.state.snake
    snake[0].Xpos =
      snake[0].Xpos >= width - blockWidth ? 0 : snake[0].Xpos + blockWidth
    this.setState({ snake })
  }

  moveHeadDown() {
    let height = this.state.height
    let blockHeight = this.state.blockHeight
    let snake = this.state.snake
    snake[0].Ypos =
      snake[0].Ypos >= height - blockHeight ? 0 : snake[0].Ypos + blockHeight
    this.setState({ snake })
  }

  handleKeyDown(event) {
    // if spacebar is pressed to run a new game
    if (this.state.isGameOver && event.key === ' ') {
      this.resetGame()
      return
    }

    if (event.key === 'p' || event.key === 'P') {
      this.setState((prevState) => ({
        isPaused: !prevState.isPaused,
      }))
    }

    if (this.state.directionChanged) return

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.goLeft()
        break
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.goUp()
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.goRight()
        break
      // case "p":
      // case "p":
      //   this.pause()
      //   break
      case 'ArrowDown':
      case 's':
      case 'S':
        this.goDown()
        break
      default:
    }
    this.setState({ directionChanged: true })
  }

  pause() {
    console.log(this.state.isPaused)
    this.setState((prevState) => ({
      isPaused: !prevState.isPaused,
    }))
  }

  goLeft() {
    let newDirection = this.state.direction === 'right' ? 'right' : 'left'
    this.setState({ direction: newDirection })
  }

  goUp() {
    let newDirection = this.state.direction === 'down' ? 'down' : 'up'
    this.setState({ direction: newDirection })
  }

  goRight() {
    let newDirection = this.state.direction === 'left' ? 'left' : 'right'
    this.setState({ direction: newDirection })
  }

  goDown() {
    let newDirection = this.state.direction === 'up' ? 'up' : 'down'
    this.setState({ direction: newDirection })
  }
  render() {
    // Game over
    if (this.state.isGameOver) {
      return (
        <GameOver
          width={this.state.width}
          height={this.state.height}
          highScore={this.state.highScore}
          newHighScore={this.state.newHighScore}
          score={this.state.score}
        />
      )
    }

    return (
      <>
        <div
          id='GameBoard'
          style={{
            width: this.state.width,
            height: this.state.height,
            borderWidth: this.state.width / 50,
          }}>
          {this.state.snake.map((snakePart, index) => {
            return (
              <div
                key={index}
                className='Block'
                style={{
                  width: this.state.blockWidth,
                  height: this.state.blockHeight,
                  left: snakePart.Xpos,
                  top: snakePart.Ypos,
                  background: this.state.snakeColor,
                }}
              />
            )
          })}
          <div
            className='Block'
            style={{
              width: this.state.blockWidth,
              height: this.state.blockHeight,
              left: this.state.apple.Xpos,
              top: this.state.apple.Ypos,
              background: this.state.appleColor,
            }}
          />
          <div id='Score' style={{ fontSize: this.state.width / 20 }}>
            HIGH-SCORE: {this.state.highScore}&ensp;&ensp;&ensp;&ensp;SCORE:{' '}
            {this.state.score}
          </div>
        </div>
        <input
          value={this.state.name}
          onChange={(event) => this.setState({ name: event.target.value })}
        />
      </>
    )
  }
}

export default SnakeGame
