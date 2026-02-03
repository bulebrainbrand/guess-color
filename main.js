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


const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'classic',
    default: '#eeeeee',
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

function showColor(r,g,b){
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

async function nextQuestion(){
    if(colorData == null)await load()
    const keys = Object.keys(colorData)
    const key = keys[Math.floor(Math.random() * keys.length)]
    const questionText = document.getElementById("question-text")
    questionText.textContent = key
    questionColor = colorData[key]
}

function failed(){
    health--
    if(health <= 0){
      end()
      return;
    }
    reRenderingHealth(health)
    submitButton.classList.remove("correct")
    submitButton.classList.remove("failed")
    submitButton.offsetWidth
    submitButton.classList.add("failed")
    nextQuestion()
}

function correct(score){
    currentScore+=score
    reRenderingScore(currentScore)
    submitButton.classList.remove("correct")
    submitButton.classList.remove("failed")
    submitButton.offsetWidth
    submitButton.classList.add("correct")
    nextQuestion()
}

form.addEventListener("submit",(e) => {
    e.preventDefault()
    const [r,g,b] = pickr.getColor().toRGBA()
    const score = getColorScore([r,g,b],questionColor)
    console.log(score)
    if(score < modeToCorrectScore[mode]){
        failed()
    }
    else{
        correct(score)
    }
    showColor(...questionColor)
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

showColor(0,0,0)

start()