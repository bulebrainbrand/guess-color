const modeToCorrectScore = {
    0:70,
    1:80,
    2:90
}
const modeToStr = {
    0:"かんたん",
    1:"ふつう",
    2:"むずかしい"
}

let colorData = null
let mode = 0
let health = 3
let questionColor = null
let currentScore = 0
let questionColorName = null

const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic',
    default: '#EBBC2C',
    swatches: [],
    components:{
        preview: true,
        opacity: false,
        lockOpacity: true, 
        hue:true,
        clear: false,
    }
});

const submitButton = document.getElementById("submit")

const form = document.getElementById("form")

pickr.on("change",(color) => {
  const [r,g,b,a] = color.toRGBA()
  submitButton.style.backgroundColor = color.toRGBA().toString()
  submitButton.style.color = `rgb(${255-r},${255-g},${255-b})`
  document.documentElement.style.setProperty("--input-color",`rgb(${r/2},${g/2},${b/2})`)
})

function showColor(name,r,g,b){
    const text = document.getElementById("result-color-name")
    text.textContent = name
    const div = document.getElementById("show-color")
    div.style.setProperty("--color",`rgb(${r},${g},${b})`)
}

function getColorScore([r1,g1,b1],[r2,g2,b2]){
    const distance = Math.hypot(r1-r2,g1-g2,b1-b2)
    return 100-Math.max(0,Math.min(Math.floor(distance / 4.42),100)) // 0-100のあいだにする
}

function reRenderingHealth(health){
    document.getElementById("health").textContent = "♥️".repeat(health)
}

function reRenderingScore(score){
    document.getElementById("score").textContent = score
}

function showCorrect(){
    const frame = document.getElementById("frame")
    frame.classList.remove("correct")
    frame.classList.remove("failed")
    frame.offsetWidth
    frame.classList.add("correct")
}

function showFailed(){
    const frame = document.getElementById("frame")
    frame.classList.remove("correct")
    frame.classList.remove("failed")
    frame.offsetWidth
    frame.classList.add("failed")
}

async function nextQuestion(){
    if(colorData == null)await load()
    const keys = Object.keys(colorData)
    const key = keys[Math.floor(Math.random() * keys.length)]
    const questionText = document.getElementById("question-text")
    questionText.textContent = key
    questionColor = colorData[key]
    questionColorName = key
}

function failed(){
    health--
    if(health <= 0){
      end()
      return;
    }
    reRenderingHealth(health)
    showFailed()
    nextQuestion()
}

function correct(score){
    currentScore+=score
    reRenderingScore(currentScore)
    showCorrect()
    nextQuestion()
}

form.addEventListener("submit",(e) => {
    e.preventDefault()
    const [r,g,b] = pickr.getColor().toRGBA()
    const score = getColorScore([r,g,b],questionColor)
    showColor(questionColorName,...questionColor)
    if(score < modeToCorrectScore[mode]){
        failed()
    }
    else{
        correct(score)
    }
})

async function fetchJson(link){
  const response = await fetch(link)
  const data = await response.json()
  return data
}


async function load(){
  colorData = await fetchJson("./data.json")
}

function start() {
  health = 3
  currentScore = 0
  reRenderingScore(currentScore)
  reRenderingHealth(health)
  submitButton.style = ""
  nextQuestion()
  showColor("ここに前回の答えが表示されます",0,0,0)
}

function end(){
    alert(`あなたのスコア: ${currentScore}\n難易度:${modeToStr[mode]}`)
    start()
}

const easyButton = document.getElementById("easy-button")

easyButton.addEventListener("click",e => {
  mode = 0
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

const normalButton = document.getElementById("normal-button")

normalButton.addEventListener("click",e => {
  mode = 1
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

const hardButton = document.getElementById("hard-button")

hardButton.addEventListener("click",e => {
  mode = 2
  window.scrollTo({
  top: 0,
  behavior: "smooth" // スムーズにスクロール
});
  start()
})

load()

start()