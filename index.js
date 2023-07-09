// imports
const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg-static')
const { spawn } = require('child_process')

// readline config
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const downloadVideoToAudio = async (url = '') => {
  try {
    let videoTitle = await (await ytdl.getInfo(url)).videoDetails.title

    // Opciones de formato de descarga
    const options = {
      quality: 'highest'
    }

    // Descarga el video utilizando ytdl-core
    console.clear()
    console.log(`Descargando video ${videoTitle} espere...`)
    const videoStream = ytdl(url, options)

    console.clear()
    console.log(`Convirtiendo video a audio...`)
    // Lanza el proceso de ffmpeg para la conversión a MP3
    const ffmpegProcess = spawn(ffmpeg, ['-i', 'pipe:0', '-vn', '-acodec', 'libmp3lame', `${videoTitle}.mp3`])

    // Aumenta el tamaño del búfer de escritura
    ffmpegProcess.stdin.highWaterMark = 1024 * 1024 * 100 // 1 MB

    // Conecta los streams de entrada y salida
    videoStream.pipe(ffmpegProcess.stdin)
    ffmpegProcess.stdout.on('data', (data) => {
      // Captura la salida de ffmpeg si es necesario
    })

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.clear()
        console.log('Video descargado!')
        console.log(`Ya puede disfrutar de su audio ${videoTitle}.mp3`)
      } else {
        console.error('Ocurrió un error durante la conversión.')
      }
    })
  } catch (error) {
    console.log(error)
  }
}

const main = async () => {
  // Ingresa la URL del video de YouTube que deseas descargar

  readline.question('Ingrese URL del video:\n', (url) => {
    const regex = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/

    if (regex.test(url)) {
      downloadVideoToAudio(url)
    } else {
      console.log('La URL no es válida.')
      process.exit(1)
    }
  })
}

main()
