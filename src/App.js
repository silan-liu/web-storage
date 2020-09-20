import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  state = {
    screen: '',
    screen2: ''
  }

  componentDidMount() {
    this.loadFileFromLocalStorgae()

    this.loadFileFromIndexedDB()
  }

  loadFileFromIndexedDB() {
    const indexedDB = window.indexedDB
    const IDBTransaction = window.IDBTransaction
    const dbVersion = 2

    const dbName = 'screenFiles'
    const request = indexedDB.open(dbName, dbVersion)
    let db
    let blob

    const createObjectStore = (db) => {
      console.log("create objectStore")
      db.createObjectStore('screen')
    }

    const getImageFile = () => {
      const xhr = new XMLHttpRequest()

      xhr.open('GET', 'screen.png', true)
      xhr.responseType = 'blob'

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          console.log('image retrieved')
          blob = xhr.response

          console.log(xhr.response)

          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target.result;
            console.log(data)
          }
          reader.readAsDataURL(blob);

          saveScreenInDb(blob)
        }
      }, false)

      xhr.send()
    }

    // 存储到 db
    const saveScreenInDb = (blob) => {
      console.log('saveScreenInDb')

      const readWriteMode = typeof IDBTransaction.READ_WRITE === 'undefined' ? 'readwrite' : IDBTransaction.READ_WRITE
      const transaction = db.transaction('screen', readWriteMode)

      console.log(readWriteMode)
      transaction.objectStore('screen').put(blob, "image")

      transaction.objectStore('screen').get("image").onsuccess = (event) => {
        const imageFile = event.target.result
        console.log('Got screen!' + imageFile)

        const screen2Img = document.getElementById("screen2")

        screen2Img.onload = () => {
          console.log('screen2Img onload')
          window.URL.revokeObjectURL(this.src);
        }

        const URL = window.URL || window.webkitURL
        const imageURL = URL.createObjectURL(imageFile)

        console.log('imageURL:' + imageURL)

        this.setState({
          screen2: imageURL
        })
      }
    }

    request.onerror = (event) => {
      console.log('error creating db')
    }

    request.onsuccess = (event) => {
      console.log('success creating db')

      db = request.result
      db.onerror = (event) => {
        console.log('error creating db')
      }

      console.log(db.version, dbVersion)

      if (db.version !== dbVersion) {
        db.version = dbVersion
        createObjectStore(db)
        getImageFile()
      } else {
        getImageFile()
      }
    }

    request.onupgradeneeded = (event) => {
      createObjectStore(event.target.result)
    }
  }

  loadFileFromLocalStorgae() {
    const key = "screenFiles"

    // localStorage.removeItem(key)
    const storageFiles = JSON.parse(localStorage.getItem(key)) || {}
    const storageFilesDate = storageFiles.date
    const screenImg = document.getElementById("screen")
    const date = new Date()
    const todayDate = (date.getMonth() + 1).toString() + date.getDate().toString()

    console.log(storageFiles, todayDate)
    console.log(screenImg.width, screenImg.height)

    // 不存在本地文件或者过期
    if (!storageFilesDate || storageFilesDate < todayDate) {

      console.log('not exist')

      // 监听 image load
      screenImg.addEventListener("load", () => {
        const imgCanvas = document.createElement("canvas")
        const imgContext = imgCanvas.getContext('2d')

        imgCanvas.width = screenImg.width * 2
        imgCanvas.height = screenImg.height * 2

        // 绘制到 canvas
        imgContext.drawImage(screenImg, 0, 0, imgCanvas.width, imgCanvas.height)

        storageFiles.screen = imgCanvas.toDataURL("image/png")
        storageFiles.date = todayDate

        try {
          // 存储到本地
          localStorage.setItem(key, JSON.stringify(storageFiles))
        } catch (error) {
          console.log('save storageFiles failed!' + error)
        }
      }, false)


      // 设置初始图片
      this.setState({
        screen: require("./screen.png")
      })

    } else {

      console.log('exist')

      // 设置本地存储的图片
      this.setState({
        screen: storageFiles.screen
      })
    }
  }

  render() {
    const { screen, screen2 } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <img id="screen" src={screen} alt=""></img>
          <img id="screen2" src={screen2} alt=""></img>
        </header>
      </div>
    );
  }
}

export default App;
